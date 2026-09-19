import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * 2Factor.in SMS OTP (API V1) — used instead of Supabase's native phone-auth
 * provider list, which doesn't include it. 2Factor generates, stores and
 * expires the OTP; we only send and verify against it. See verifyPhoneOtpAction
 * in app/(auth)/actions.ts for how a verified number becomes a Supabase session.
 *
 * 2Factor verifies by *session id* (returned when the code is sent), not by
 * phone number. If the browser were trusted to hand that id back, someone could
 * request a code for their own phone, then submit it against a victim's number
 * and pass. So the session id never reaches the client: it's stored in a signed,
 * httpOnly cookie together with the phone it was issued for, and verification
 * requires the submitted phone to match.
 */

type OtpResult = { success: true } | { success: false; error: string };

const COOKIE_NAME = "otp_session";
const SESSION_TTL_SECONDS = 10 * 60;

function tenDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function signingSecret(): string | undefined {
  return process.env.OTP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

async function writeSession(phone: string, sessionId: string, secret: string) {
  const payload = Buffer.from(
    JSON.stringify({ phone, sessionId, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })
  ).toString("base64url");
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

async function readSession(secret: string): Promise<{ phone: string; sessionId: string } | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.phone !== "string" || typeof data.sessionId !== "string") return null;
    return { phone: data.phone, sessionId: data.sessionId };
  } catch {
    return null;
  }
}

const NOT_CONFIGURED: OtpResult = {
  success: false,
  error: "SMS sign-in isn't set up yet — please try email instead.",
};

export async function sendTwoFactorOtp(phone: string): Promise<OtpResult> {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const secret = signingSecret();
  if (!apiKey || !secret) return NOT_CONFIGURED;

  const number = tenDigits(phone);
  // Optional: a DLT-approved custom template name from the 2Factor dashboard.
  // Omitted, 2Factor uses its default OTP template.
  const template = process.env.TWOFACTOR_TEMPLATE_NAME;
  const url =
    `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${number}/AUTOGEN` +
    (template ? `/${encodeURIComponent(template)}` : "");

  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.Status !== "Success" || typeof data?.Details !== "string") {
      console.error("2Factor send OTP failed:", res.status, data);
      return { success: false, error: "Could not send the code. Please try again." };
    }
    await writeSession(number, data.Details, secret);
    return { success: true };
  } catch (error) {
    console.error("2Factor send OTP threw:", error);
    return { success: false, error: "Could not send the code. Please try again." };
  }
}

export async function verifyTwoFactorOtp(phone: string, otp: string): Promise<OtpResult> {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const secret = signingSecret();
  if (!apiKey || !secret) return NOT_CONFIGURED;

  const session = await readSession(secret);
  if (!session || session.phone !== tenDigits(phone)) {
    return { success: false, error: "That code has expired. Please request a new one." };
  }

  try {
    const res = await fetch(
      `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/VERIFY/${encodeURIComponent(session.sessionId)}/${encodeURIComponent(otp)}`,
      { method: "GET", cache: "no-store" }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.Status !== "Success") {
      return { success: false, error: "Incorrect or expired code. Please try again." };
    }
    // Single use: a matched code can't be replayed against the same session.
    (await cookies()).delete(COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error("2Factor verify OTP threw:", error);
    return { success: false, error: "Could not verify the code. Please try again." };
  }
}
