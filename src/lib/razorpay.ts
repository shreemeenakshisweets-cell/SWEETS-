import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";

let cachedClient: Razorpay | null = null;

/**
 * Lazily constructs the Razorpay client on first use. The SDK's constructor
 * throws if `key_id` is missing, and Next.js evaluates route modules at
 * build time to collect page data — so a top-level `new Razorpay(...)`
 * would crash the build whenever the keys aren't set yet (e.g. before
 * they're configured in Vercel's environment variables).
 */
export function getRazorpay() {
  if (!cachedClient) {
    cachedClient = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return cachedClient;
}

/** Verifies the signature Razorpay returns to the client on checkout success. */
export function verifyPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(razorpaySignature, "utf8");

  // timingSafeEqual throws on length mismatch rather than returning false —
  // the digest length is a fixed public constant, so short-circuiting here
  // leaks nothing an attacker doesn't already know.
  if (expectedBuf.length !== receivedBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
