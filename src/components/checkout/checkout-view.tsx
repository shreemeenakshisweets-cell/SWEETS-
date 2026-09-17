"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { MapPin, PackageCheck, Phone, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AddressForm } from "@/components/checkout/address-form";
import { requestPhoneOtpAction, verifyPhoneOtpAction } from "@/app/(auth)/actions";
import { phoneOtpVerifySchema } from "@/lib/validation/auth";
import { fromE164 } from "@/lib/utils/phone";
import { cartItemCount, cartTotals, useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import type { Address } from "@/generated/prisma/client";

const OTP_RESEND_SECONDS = 30;

export function CheckoutView({
  initialAddresses,
  customerEmail,
  customerPhone,
  phoneVerified,
}: {
  initialAddresses: Address[];
  customerEmail: string;
  customerPhone: string | null;
  phoneVerified: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [addresses, setAddresses] = React.useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = React.useState(
    initialAddresses.find((a) => a.isDefault)?.id ?? initialAddresses[0]?.id ?? ""
  );
  const [deliveryInstructions, setDeliveryInstructions] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [placingOrder, setPlacingOrder] = React.useState(false);

  // Phone re-verification gate — only relevant when the account has a
  // verified phone; once confirmed for this checkout session, subsequent
  // "Pay" clicks skip straight to payment.
  const [phoneOtpVerified, setPhoneOtpVerified] = React.useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = React.useState(false);
  const [otpStep, setOtpStep] = React.useState<"send" | "code">("send");
  const [otpCode, setOtpCode] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpResendIn, setOtpResendIn] = React.useState(0);
  const phoneDigits = customerPhone ? fromE164(customerPhone) : "";

  React.useEffect(() => {
    if (otpResendIn <= 0) return;
    const id = setInterval(() => setOtpResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [otpResendIn]);

  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const clearCart = useCartStore((s) => s.clearCart);

  // Hydration guard: cart is localStorage-only, must match SSR on first paint.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  const totals = cartTotals(items, coupon);
  const count = mounted ? cartItemCount(items) : 0;

  function handleAddressSaved(address: Address) {
    setAddresses((prev) => [
      address,
      ...(address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev),
    ]);
    setSelectedAddressId(address.id);
    setDialogOpen(false);
  }

  function handlePlaceOrderClick() {
    if (!selectedAddressId) {
      toast.error("Select a delivery address");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    // Only accounts with a verified phone go through this step-up check —
    // everyone else's checkout is unchanged.
    if (phoneVerified && !phoneOtpVerified) {
      setOtpDialogOpen(true);
      if (otpStep === "send" && otpResendIn === 0) void sendCheckoutOtp();
      return;
    }
    void proceedToPayment();
  }

  async function sendCheckoutOtp() {
    setOtpLoading(true);
    const result = await requestPhoneOtpAction({ phone: phoneDigits });
    setOtpLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("We sent a 6-digit code by SMS");
    setOtpStep("code");
    setOtpResendIn(OTP_RESEND_SECONDS);
  }

  async function verifyCheckoutOtp(e: React.FormEvent) {
    e.preventDefault();
    const parsed = phoneOtpVerifySchema.safeParse({ phone: phoneDigits, token: otpCode });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter the 6-digit code");
      return;
    }
    setOtpLoading(true);
    const result = await verifyPhoneOtpAction(parsed.data);
    setOtpLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPhoneOtpVerified(true);
    setOtpDialogOpen(false);
    setOtpStep("send");
    setOtpCode("");
    toast.success("Phone verified");
    void proceedToPayment();
  }

  async function proceedToPayment() {
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
          addressId: selectedAddressId,
          deliveryInstructions,
          couponCode: coupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not place order");
        setPlacingOrder(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Shree Meenakshi Sweets & Savouries",
        description: `Order ${data.orderNumber}`,
        prefill: {
          name: data.customer.name,
          email: data.customer.email,
          contact: data.customer.contact,
        },
        theme: { color: "#7a6118" },
        // Hide EMI and Pay Later — irrelevant for typical sweets/savouries
        // order values, just clutter. UPI, Cards, Netbanking, and Wallets
        // stay visible.
        config: {
          display: {
            hide: [{ method: "emi" }, { method: "paylater" }],
          },
        },
        handler: async (response) => {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...response }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast.error(verifyData.error ?? "Payment verification failed");
            setPlacingOrder(false);
            return;
          }
          clearCart();
          toast.success("Payment successful!");
          router.push(`/orders/${data.orderNumber}/confirmation`);
        },
        modal: {
          ondismiss: () => setPlacingOrder(false),
        },
      });
      razorpay.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setPlacingOrder(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="font-heading text-3xl font-semibold text-foreground">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <MapPin className="size-4 text-primary" /> Delivery Address
              </h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button variant="outline" size="sm" nativeButton={false} />}>
                  <Plus className="size-3.5" /> Add New
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add delivery address</DialogTitle>
                  </DialogHeader>
                  <AddressForm onSaved={handleAddressSaved} />
                </DialogContent>
              </Dialog>
            </div>

            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any saved addresses yet. Add one to continue.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      selectedAddressId === address.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {address.fullName}{" "}
                        <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
                          {address.type}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                        {address.state} {address.postalCode}
                      </p>
                      <p className="text-muted-foreground">Phone: {address.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-background p-5">
            <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
              Delivery Instructions
            </h2>
            <Textarea
              placeholder="E.g. Leave at the door, call on arrival, landmark details..."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              maxLength={500}
            />
          </section>

          <section className="rounded-2xl border border-border bg-background p-5">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Order Review ({count} item{count === 1 ? "" : "s"})
            </h2>
            <ul className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-3 py-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.variantLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Discount ({coupon?.code})</span>
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

          {phoneVerified && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2 text-xs text-foreground/80">
              <ShieldCheck className="size-3.5 shrink-0 text-primary" />
              We&apos;ll confirm +91 {phoneDigits} with an SMS code before placing your order.
            </div>
          )}

          <Button
            size="lg"
            className="mt-5 w-full gap-2"
            onClick={handlePlaceOrderClick}
            disabled={placingOrder || items.length === 0 || !selectedAddressId}
          >
            <PackageCheck className="size-4" />
            {placingOrder ? "Processing..." : `Pay ${formatCurrency(totals.total)}`}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Signed in as {customerEmail}
          </p>
        </aside>
      </div>

      <Dialog
        open={otpDialogOpen}
        onOpenChange={(open) => {
          setOtpDialogOpen(open);
          if (!open) {
            setOtpStep("send");
            setOtpCode("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> Confirm Your Phone Number
            </DialogTitle>
          </DialogHeader>
          {otpStep === "send" ? (
            <p className="text-sm text-muted-foreground">
              {otpLoading ? "Sending a code..." : `Sending a code to +91 ${phoneDigits}...`}
            </p>
          ) : (
            <form onSubmit={verifyCheckoutOtp} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to +91 {phoneDigits} to confirm this order.
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" disabled={otpLoading || otpCode.length < 6}>
                {otpLoading ? "Verifying..." : "Verify & Place Order"}
              </Button>
              <button
                type="button"
                onClick={() => void sendCheckoutOtp()}
                disabled={otpResendIn > 0 || otpLoading}
                className="text-center text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {otpResendIn > 0 ? `Resend code in ${otpResendIn}s` : "Resend code"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
