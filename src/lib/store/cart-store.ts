"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeOrderTotals, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, TAX_RATE } from "@/lib/pricing";

export { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, TAX_RATE };

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

interface AppliedCoupon {
  code: string;
  label: string;
  discount: number; // pre-computed discount amount, in rupees
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + quantity, i.maxStock),
                  }
                : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          });
        }
      },
      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [], coupon: null }),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
    }),
    { name: "shree-meenakshi-cart" }
  )
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotals(items: CartItem[], coupon: AppliedCoupon | null) {
  const subtotal = cartSubtotal(items);
  const discount = coupon ? coupon.discount : 0;
  return computeOrderTotals(subtotal, discount, items.length);
}
