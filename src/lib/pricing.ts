export const TAX_RATE = 0.05;
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 49;

export function computeOrderTotals(
  subtotal: number,
  discount: number,
  itemCount: number
) {
  const safeDiscount = Math.min(discount, subtotal);
  const discountedSubtotal = subtotal - safeDiscount;
  const deliveryFee =
    itemCount === 0 || discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const taxAmount = Math.round(discountedSubtotal * TAX_RATE);
  const total = discountedSubtotal + deliveryFee + taxAmount;

  return { subtotal, discount: safeDiscount, deliveryFee, taxAmount, total };
}
