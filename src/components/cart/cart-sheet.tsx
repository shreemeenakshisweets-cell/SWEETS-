"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  cartItemCount,
  cartTotals,
  useCartStore,
} from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";

export function CartSheet() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // Deliberate hydration guard: the persisted Zustand store only exists in
  // localStorage, so counts must read as empty on the server and hydrate
  // after mount to avoid a mismatch. Not a case of syncing to an external
  // system.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  const count = mounted ? cartItemCount(items) : 0;
  const totals = cartTotals(items, coupon);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open cart" className="relative" />}
      >
        <ShoppingBag className="size-[1.15rem]" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-semibold text-accent-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Your Cart</SheetTitle>
        </SheetHeader>

        {!mounted || items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Your cart is empty. Explore our menu to add something sweet.
            </p>
            <SheetClose
              render={
                <Link
                  href="/menu"
                  className={buttonVariants({ variant: "secondary", className: "mt-2" })}
                />
              }
            >
              Browse Menu
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col gap-4 py-2">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/menu/${item.productSlug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium leading-tight hover:text-primary"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          aria-label={`Remove ${item.productName}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 rounded-full border border-border px-1">
                          <button
                            className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="gap-3 border-t border-border pt-4">
              <div className="flex flex-col gap-1.5 text-sm">
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
                  <span>Tax (GST)</span>
                  <span className="tabular-nums">{formatCurrency(totals.taxAmount)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.total)}</span>
                </div>
              </div>
              <SheetClose
                render={
                  <Link
                    href="/cart"
                    className={buttonVariants({ size: "lg", className: "w-full" })}
                  />
                }
              >
                View Cart &amp; Checkout
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
