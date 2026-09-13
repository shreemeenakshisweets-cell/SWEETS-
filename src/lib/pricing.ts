export const TAX_RATE = 0.05;
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 49;

/**
 * Automatic volume-discount tiers — no code needed, applied purely by
 * order value. Kept as an ordered list (highest threshold first) so
 * getAutoDiscountTier() can just find the first one the subtotal clears.
 */
export const VOLUME_DISCOUNT_TIERS = [
  { minSubtotal: 2500, rate: 0.1, label: "10% off orders above ₹2,500" },
  { minSubtotal: 1800, rate: 0.05, label: "5% off orders above ₹1,800" },
] as const;

export function getAutoDiscountTier(subtotal: number) {
  return VOLUME_DISCOUNT_TIERS.find((tier) => subtotal >= tier.minSubtotal) ?? null;
}

/**
 * `couponDiscount` is the absolute discount a valid coupon would give;
 * this compares it against the automatic volume-discount tier for the
 * same subtotal and applies whichever is larger — the two never stack,
 * so a customer always gets the single best available discount.
 */
export function computeOrderTotals(
  subtotal: number,
  couponDiscount: number,
  itemCount: number
) {
  const autoTier = getAutoDiscountTier(subtotal);
  const autoDiscount = autoTier ? Math.round(subtotal * autoTier.rate) : 0;
  const discount = Math.min(Math.max(couponDiscount, autoDiscount), subtotal);

  const discountedSubtotal = subtotal - discount;
  const deliveryFee =
    itemCount === 0 || discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const taxAmount = Math.round(discountedSubtotal * TAX_RATE);
  const total = discountedSubtotal + deliveryFee + taxAmount;

  return { subtotal, discount, deliveryFee, taxAmount, total };
}
