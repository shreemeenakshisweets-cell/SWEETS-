"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  cartTotals,
  FREE_DELIVERY_THRESHOLD,
  useCartStore,
} from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";

export function CartView() {
  const [mounted, setMounted] = React.useState(false);
  const [couponInput, setCouponInput] = React.useState("");
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  // Deliberate hydration guard: the persisted Zustand store only exists in
  // localStorage, so the cart must read as empty on the server and hydrate
  // after mount to avoid a mismatch. Not a case of syncing to an external
  // system.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  const totals = cartTotals(items, coupon);
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal);

  const [applyingCoupon, setApplyingCoupon] = React.useState(false);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal: totals.subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not apply coupon");
        return;
      }
      applyCoupon({ code: data.code, label: data.label, discount: data.discount });
      toast.success(`Applied coupon ${data.code}`);
      setCouponInput("");
    } finally {
      setApplyingCoupon(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="size-12 text-muted-foreground/40" />
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Your cart is empty
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet. Explore our menu to find
          something sweet.
        </p>
        <Button render={<Link href="/menu" />} nativeButton={false} size="lg">
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Your Cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} item{items.length === 1 ? "" : "s"} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border lg:col-span-2">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 p-4 sm:p-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-24">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/menu/${item.productSlug}`}
                      className="font-heading text-base font-semibold text-foreground hover:text-primary"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Remove ${item.productName}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 rounded-full border border-border px-1.5">
                    <button
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-heading text-base font-semibold text-foreground">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Order Summary
          </h2>

          {remainingForFreeDelivery > 0 ? (
            <p className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
              Add {formatCurrency(remainingForFreeDelivery)} more for free delivery.
            </p>
          ) : (
            <p className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
              You&apos;ve unlocked free delivery.
            </p>
          )}

          {coupon ? (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 text-primary">
                <Tag className="size-3.5" /> {coupon.code}
              </span>
              <button
                onClick={() => {
                  removeCoupon();
                  toast("Coupon removed");
                }}
                aria-label="Remove coupon"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              />
              <Button variant="secondary" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                {applyingCoupon ? "Applying..." : "Apply"}
              </Button>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="tabular-nums">
                {totals.deliveryFee === 0 ? "Free" : formatCurrency(totals.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (GST 5%)</span>
              <span className="tabular-nums">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <Button
            size="lg"
            render={<Link href="/checkout" />}
            nativeButton={false}
            className="mt-5 w-full"
          >
            Proceed to Checkout
          </Button>
          <Button
            variant="ghost"
            render={<Link href="/menu" />}
            nativeButton={false}
            className="mt-2 w-full"
          >
            Continue Shopping
          </Button>
        </aside>
      </div>
    </div>
  );
}
