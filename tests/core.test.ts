// Run with:  npx tsx --test tests/core.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeOrderTotals, getAutoDiscountTier, DELIVERY_FEE } from "../src/lib/pricing";
import { normalizePhone, toE164, fromE164 } from "../src/lib/utils/phone";
import {
  newPasswordSchema,
  phoneOnlySchema,
  phoneOtpVerifySchema,
  signUpSchema,
} from "../src/lib/validation/auth";
import { addressInputSchema, checkoutRequestSchema } from "../src/lib/validation/checkout";
import { generateOrderNumber } from "../src/lib/order-number";

// ---------------------------------------------------------------- pricing
test("pricing: empty cart is all zeros (no delivery fee)", () => {
  assert.deepEqual(computeOrderTotals(0, 0, 0), {
    subtotal: 0, discount: 0, deliveryFee: 0, taxAmount: 0, total: 0,
  });
});

test("pricing: small order pays delivery + 5% tax", () => {
  const t = computeOrderTotals(500, 0, 1);
  assert.equal(t.deliveryFee, DELIVERY_FEE);
  assert.equal(t.taxAmount, 25);
  assert.equal(t.total, 500 + 49 + 25);
});

test("pricing: free-delivery boundary is exactly 999", () => {
  assert.equal(computeOrderTotals(998, 0, 1).deliveryFee, 49);
  assert.equal(computeOrderTotals(999, 0, 1).deliveryFee, 0);
});

test("pricing: volume discount tiers switch at 1800 and 2500", () => {
  assert.equal(getAutoDiscountTier(1799), null);
  assert.equal(getAutoDiscountTier(1800)?.rate, 0.05);
  assert.equal(getAutoDiscountTier(2499)?.rate, 0.05);
  assert.equal(getAutoDiscountTier(2500)?.rate, 0.1);
  assert.equal(computeOrderTotals(1800, 0, 2).discount, 90);
  assert.equal(computeOrderTotals(2500, 0, 2).discount, 250);
});

test("pricing: coupon and volume discount never stack — best one wins", () => {
  assert.equal(computeOrderTotals(2500, 400, 2).discount, 400); // coupon bigger
  assert.equal(computeOrderTotals(2500, 100, 2).discount, 250); // tier bigger
});

test("pricing: discount can never exceed the subtotal", () => {
  const t = computeOrderTotals(200, 5000, 1);
  assert.equal(t.discount, 200);
  assert.equal(t.taxAmount, 0);
  assert.ok(t.total >= 0);
});

test("pricing: total always equals discounted subtotal + delivery + tax", () => {
  for (let subtotal = 0; subtotal <= 6000; subtotal += 7) {
    for (const coupon of [0, 50, 300, 10000]) {
      const t = computeOrderTotals(subtotal, coupon, 1);
      assert.equal(t.total, subtotal - t.discount + t.deliveryFee + t.taxAmount, `s=${subtotal} c=${coupon}`);
      assert.ok(t.discount >= 0 && t.discount <= subtotal);
      assert.ok(Number.isInteger(t.taxAmount) && Number.isInteger(t.discount));
    }
  }
});

// Documents current behaviour worth a product decision: a coupon can drop the
// discounted subtotal under the free-delivery line and ADD a delivery fee.
test("pricing (behaviour note): coupon can push order below free delivery", () => {
  assert.equal(computeOrderTotals(1050, 0, 1).deliveryFee, 0);
  assert.equal(computeOrderTotals(1050, 100, 1).deliveryFee, 49);
});

// ------------------------------------------------------------------ phone
test("phone: normalizePhone accepts every common shape", () => {
  for (const raw of ["9876543210", "919876543210", "+919876543210"]) {
    assert.equal(normalizePhone(raw), "+919876543210");
  }
  assert.equal(toE164("9876543210"), "+919876543210");
  assert.equal(fromE164("+919876543210"), "9876543210");
});

test("phone schema: valid and invalid numbers", () => {
  for (const ok of ["9876543210", "+919876543210", "6000000000"]) {
    assert.ok(phoneOnlySchema.safeParse({ phone: ok }).success, ok);
  }
  for (const bad of ["", "12345", "5876543210", "98765432100", "98765 43210", "+9198765432", "abcdefghij"]) {
    assert.equal(phoneOnlySchema.safeParse({ phone: bad }).success, false, `should reject "${bad}"`);
  }
});

test("phone OTP schema needs exactly 6 characters", () => {
  const base = { phone: "9876543210" };
  assert.ok(phoneOtpVerifySchema.safeParse({ ...base, token: "123456" }).success);
  for (const bad of ["12345", "1234567", ""]) {
    assert.equal(phoneOtpVerifySchema.safeParse({ ...base, token: bad }).success, false);
  }
});

// ------------------------------------------------------------------- auth
test("signup schema: password / email / name rules", () => {
  const ok = { fullName: "Priya S", email: "priya@example.com", password: "12345678" };
  assert.ok(signUpSchema.safeParse(ok).success);
  assert.equal(signUpSchema.safeParse({ ...ok, password: "1234567" }).success, false);
  assert.equal(signUpSchema.safeParse({ ...ok, email: "not-an-email" }).success, false);
  assert.equal(signUpSchema.safeParse({ ...ok, fullName: "P" }).success, false);
});

test("new-password schema rejects mismatched confirmation", () => {
  assert.ok(newPasswordSchema.safeParse({ password: "abcdefgh", confirmPassword: "abcdefgh" }).success);
  assert.equal(newPasswordSchema.safeParse({ password: "abcdefgh", confirmPassword: "abcdefgX" }).success, false);
});

// --------------------------------------------------------------- checkout
test("address schema: PIN code and phone rules", () => {
  const ok = {
    type: "HOME", fullName: "Priya Sharma", phone: "9876543210", line1: "12 MG Road",
    city: "Vijayawada", state: "Andhra Pradesh", postalCode: "520001", isDefault: false,
  };
  assert.ok(addressInputSchema.safeParse(ok).success);
  for (const postalCode of ["52000", "5200011", "abcdef", ""]) {
    assert.equal(addressInputSchema.safeParse({ ...ok, postalCode }).success, false, postalCode);
  }
  assert.equal(addressInputSchema.safeParse({ ...ok, phone: "1234567890" }).success, false);
  assert.equal(addressInputSchema.safeParse({ ...ok, type: "CASTLE" }).success, false);
});

test("checkout request: item quantity bounds and required fields", () => {
  const addressId = "00000000-0000-4000-8000-000000000000";
  const ok = { items: [{ sku: "SM-1", quantity: 1 }], addressId };
  assert.ok(checkoutRequestSchema.safeParse(ok).success);
  assert.equal(checkoutRequestSchema.safeParse({ ...ok, items: [] }).success, false);
  assert.equal(checkoutRequestSchema.safeParse({ ...ok, items: [{ sku: "SM-1", quantity: 0 }] }).success, false);
  assert.equal(checkoutRequestSchema.safeParse({ ...ok, items: [{ sku: "SM-1", quantity: 51 }] }).success, false);
  assert.equal(checkoutRequestSchema.safeParse({ ...ok, items: [{ sku: "SM-1", quantity: 1.5 }] }).success, false);
  assert.equal(checkoutRequestSchema.safeParse({ ...ok, addressId: "nope" }).success, false);
  assert.equal(checkoutRequestSchema.safeParse({ ...ok, deliveryInstructions: "x".repeat(501) }).success, false);
});

test("order numbers look right and don't collide", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 5000; i++) {
    const n = generateOrderNumber();
    assert.match(n, /^SM-\d{8}-[0-9A-F]{8}$/);
    seen.add(n);
  }
  assert.equal(seen.size, 5000);
});
