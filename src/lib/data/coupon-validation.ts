import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Authoritative, DB-backed coupon check — used by both the cart's live
 * preview (/api/coupons/apply) and the checkout API. Never trust a
 * discount amount computed on the client.
 */
export async function validateCoupon(code: string, subtotal: number, userId: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { error: "Invalid or expired coupon code." };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { error: "This coupon isn't active yet." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { error: "This coupon has expired." };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { error: "This coupon has reached its usage limit." };
  }

  const minOrderValue = coupon.minOrderValue ? Number(coupon.minOrderValue) : 0;
  if (subtotal < minOrderValue) {
    return { error: `Add items worth ₹${(minOrderValue - subtotal).toFixed(0)} more to use this coupon.` };
  }

  if (coupon.perUserLimit !== null) {
    const redemptions = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId },
    });
    if (redemptions >= coupon.perUserLimit) {
      return { error: "You've already used this coupon the maximum number of times." };
    }
  }

  const value = Number(coupon.value);
  const rawDiscount = coupon.type === "PERCENTAGE" ? (subtotal * value) / 100 : value;
  const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : rawDiscount;
  const discount = Math.round(Math.min(rawDiscount, maxDiscount, subtotal));

  return { coupon, discount };
}

/**
 * Marks a coupon as redeemed once an order is actually confirmed (paid) —
 * never at order creation, so abandoned/failed payments don't burn a
 * customer's usage. Call inside the same confirmation transaction; safe to
 * call unconditionally since CouponRedemption.orderId is unique.
 */
export async function redeemCouponIfAny(
  tx: Prisma.TransactionClient,
  order: { id: string; userId: string; couponId: string | null }
) {
  if (!order.couponId) return;

  await tx.coupon.update({
    where: { id: order.couponId },
    data: { usedCount: { increment: 1 } },
  });
  await tx.couponRedemption.create({
    data: { couponId: order.couponId, userId: order.userId, orderId: order.id },
  });
}
