import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/** Six digits, never starting with 0 so a voice call can't be misheard as shorter. */
export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

/**
 * Keyed hash of a code, bound to the request row and the phone it was sent to.
 * Only this is stored — a 6-digit code has just a million possibilities, so it
 * is HMAC'd with a server secret rather than saved (or plain-hashed).
 */
export function hashOtpCode(secret: string, requestId: string, phone: string, code: string): string {
  return createHmac("sha256", secret).update(`${requestId}:${phone}:${code}`).digest("base64url");
}

export function otpCodeMatches(
  secret: string,
  requestId: string,
  phone: string,
  submitted: string,
  storedHash: string
): boolean {
  const expected = Buffer.from(hashOtpCode(secret, requestId, phone, submitted));
  const actual = Buffer.from(storedHash);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
