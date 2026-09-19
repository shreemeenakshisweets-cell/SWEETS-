import "server-only";
import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtpCode, otpCodeMatches } from "@/lib/otp-code";

/**
 * TEMPORARY: one-time codes delivered as an automated voice call through
 * 2Factor.in (API V1, `VOICE` route), while 2Factor's WhatsApp service is
 * still being set up on their side. When it's ready, add a WhatsApp variant
 * here with the same shape (send/verify returning OtpResult) and switch the
 * calls in app/(auth)/actions.ts — the code handling and limits below apply to
 * any channel.
 *
 * 2Factor only *delivers* the call. Its auto-generated codes are 4 digits, but
 * this site uses 6, so we generate the 6-digit code ourselves, have 2Factor
 * read it out (`VOICE/{number}/{code}`), and verify it here. Only a keyed hash
 * of the code is stored (`otp_requests.codeHash`), never the code itself.
 *
 * Request binding: the request id lives in a signed, httpOnly cookie together
 * with the phone it was issued for, and verification requires the submitted
 * phone to match — so a code requested for one number can't be used to sign in
 * as another.
 *
 * Abuse control: a voice call costs money and rings a real phone, so calls are
 * limited per number and per IP, and wrong guesses per request are capped.
 */

type OtpResult = { success: true } | { success: false; error: string };

const COOKIE_NAME = "otp_session";
const SESSION_TTL_SECONDS = 10 * 60;
const MINUTE = 60 * 1000;
const PER_PHONE = { max: 3, windowMs: 15 * MINUTE };
const PER_IP = { max: 10, windowMs: 60 * MINUTE };
const MAX_WRONG_GUESSES = 5;

const NOT_CONFIGURED: OtpResult = {
  success: false,
  error: "Phone sign-in isn't set up yet — please use email instead.",
};

function tenDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function signingSecret(): string | undefined {
  return process.env.OTP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

async function writeSession(phone: string, requestId: string, secret: string) {
  const payload = Buffer.from(
    JSON.stringify({ phone, requestId, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })
  ).toString("base64url");
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

async function readSession(secret: string): Promise<{ phone: string; requestId: string } | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (typeof data.phone !== "string" || typeof data.requestId !== "string") return null;
    return { phone: data.phone, requestId: data.requestId };
  } catch {
    return null;
  }
}

async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

export async function sendVoiceOtp(phone: string): Promise<OtpResult> {
  const apiKey = process.env.TWOFACTOR_API_KEY;
  const secret = signingSecret();
  if (!apiKey || !secret) return NOT_CONFIGURED;

  const number = tenDigits(phone);
  const ip = await clientIp();

  try {
    const now = Date.now();
    const [byPhone, byIp] = await Promise.all([
      prisma.otpRequest.count({
        where: { phone: number, createdAt: { gt: new Date(now - PER_PHONE.windowMs) } },
      }),
      ip
        ? prisma.otpRequest.count({
            where: { ip, createdAt: { gt: new Date(now - PER_IP.windowMs) } },
          })
        : Promise.resolve(0),
    ]);
    if (byPhone >= PER_PHONE.max || byIp >= PER_IP.max) {
      return { success: false, error: "Too many attempts. Please wait a few minutes and try again." };
    }

    // Counted before the provider call, so a failing/slow call can't be retried in a tight loop.
    const request = await prisma.otpRequest.create({ data: { phone: number, ip } });
    // Housekeeping: nothing older than a day is ever consulted.
    void prisma.otpRequest
      .deleteMany({ where: { createdAt: { lt: new Date(now - 24 * 60 * MINUTE) } } })
      .catch(() => {});

    const code = generateOtpCode();
    const res = await fetch(
      `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/VOICE/${number}/${code}`,
      { method: "GET", cache: "no-store" }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.Status !== "Success") {
      console.error("2Factor voice OTP send failed:", res.status, data?.Details);
      if (String(data?.Details).includes("Duplicate request")) {
        return { success: false, error: "Please wait a few seconds before asking for another call." };
      }
      if (String(data?.Details).includes("Invalid Phone Number")) {
        return { success: false, error: "We couldn't call that number. Please check it and try again." };
      }
      return { success: false, error: "Could not place the call. Please try again." };
    }

    await prisma.otpRequest.update({
      where: { id: request.id },
      data: {
        codeHash: hashOtpCode(secret, request.id, number, code),
        sessionId: typeof data.Details === "string" ? data.Details : null,
      },
    });
    await writeSession(number, request.id, secret);
    return { success: true };
  } catch (error) {
    console.error("2Factor voice OTP send threw:", error);
    return { success: false, error: "Could not place the call. Please try again." };
  }
}

export async function verifyVoiceOtp(phone: string, otp: string): Promise<OtpResult> {
  const secret = signingSecret();
  if (!process.env.TWOFACTOR_API_KEY || !secret) return NOT_CONFIGURED;

  const number = tenDigits(phone);
  const expiredMessage = "That code has expired. Please request a new call.";

  const session = await readSession(secret);
  if (!session || session.phone !== number) return { success: false, error: expiredMessage };

  try {
    const record = await prisma.otpRequest.findUnique({ where: { id: session.requestId } });
    const fresh = record && record.createdAt.getTime() > Date.now() - SESSION_TTL_SECONDS * 1000;
    if (!record || record.phone !== number || !record.codeHash || !fresh) {
      return { success: false, error: expiredMessage };
    }
    if (record.attempts >= MAX_WRONG_GUESSES) {
      (await cookies()).delete(COOKIE_NAME);
      return { success: false, error: "Too many incorrect attempts. Please request a new call." };
    }

    if (otpCodeMatches(secret, record.id, number, otp, record.codeHash)) {
      // Single use: clearing the hash means this code can never be accepted again.
      await prisma.otpRequest.update({ where: { id: record.id }, data: { codeHash: null } });
      (await cookies()).delete(COOKIE_NAME);
      return { success: true };
    }

    await prisma.otpRequest.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    const left = Math.max(0, MAX_WRONG_GUESSES - (record.attempts + 1));
    return {
      success: false,
      error:
        left > 0
          ? `Incorrect code. ${left} ${left === 1 ? "attempt" : "attempts"} left.`
          : "Too many incorrect attempts. Please request a new call.",
    };
  } catch (error) {
    console.error("2Factor voice OTP verify threw:", error);
    return { success: false, error: "Could not verify the code. Please try again." };
  }
}
