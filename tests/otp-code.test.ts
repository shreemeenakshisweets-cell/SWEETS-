// Run with:  npx tsx --test tests/otp-code.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateOtpCode, hashOtpCode, otpCodeMatches } from "../src/lib/otp-code";

const secret = "test-secret";
const id = "11111111-1111-4111-8111-111111111111";
const phone = "9876543210";

test("generated codes are always exactly 6 digits, never starting with 0", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 20000; i++) {
    const c = generateOtpCode();
    assert.match(c, /^[1-9]\d{5}$/);
    seen.add(c);
  }
  assert.ok(seen.size > 15000, "codes should be well spread, got " + seen.size);
});

test("the correct code matches its stored hash", () => {
  const hash = hashOtpCode(secret, id, phone, "482913");
  assert.ok(otpCodeMatches(secret, id, phone, "482913", hash));
});

test("wrong code, wrong phone, wrong request and wrong secret are all rejected", () => {
  const hash = hashOtpCode(secret, id, phone, "482913");
  assert.equal(otpCodeMatches(secret, id, phone, "482914", hash), false);
  assert.equal(otpCodeMatches(secret, id, "9876543211", "482913", hash), false);
  assert.equal(otpCodeMatches(secret, "22222222-2222-4222-8222-222222222222", phone, "482913", hash), false);
  assert.equal(otpCodeMatches("other-secret", id, phone, "482913", hash), false);
});

test("stored hash doesn't contain the code, and malformed input never throws", () => {
  const hash = hashOtpCode(secret, id, phone, "482913");
  assert.ok(!hash.includes("482913"));
  assert.equal(otpCodeMatches(secret, id, phone, "", hash), false);
  assert.equal(otpCodeMatches(secret, id, phone, "482913", "short"), false);
});
