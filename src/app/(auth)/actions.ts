"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
// TEMPORARY: voice-call codes until 2Factor's WhatsApp service is ready (see lib/twofactor.ts).
import { sendVoiceOtp, verifyVoiceOtp } from "@/lib/twofactor";
import { normalizePhone } from "@/lib/utils/phone";
import { phoneLoginEmail } from "@/lib/utils/contact";
import {
  emailOnlySchema,
  newPasswordSchema,
  otpVerifySchema,
  phoneOnlySchema,
  phoneOtpVerifySchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

type ActionResult = { error?: string; success?: true };

// `||` (not `??`) so an env var that's set-but-empty on the host still falls back.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

/** Sends a one-time passcode to the given email (Supabase email OTP). */
export async function requestOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = emailOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function verifyOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = otpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Sends a one-time code by voice call to sign in (or, for a brand-new number, sign up)
 * with a phone number. Voice-call OTP isn't one of Supabase's native phone-auth
 * providers (Twilio/MessageBird/Vonage/TextLocal only), so the OTP itself
 * is sent and checked entirely outside Supabase — see verifyPhoneOtpAction
 * for how a verified number gets bridged into a real Supabase session.
 */
export async function requestPhoneOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await sendVoiceOtp(parsed.data.phone);
  return result.success ? { success: true } : { error: result.error };
}

/**
 * On a correct code, bridges the verified phone into a real Supabase session
 * (via the service-role Admin API — there's no native phone-provider flow to
 * lean on). Supabase's Phone provider is deliberately OFF: enabling it exposes
 * public phone sign-up, which lets anyone pre-register a stranger's number
 * before its owner does. So phone accounts use the email path instead:
 *
 * - The account for this number is found by phone (`users.phone`). If none
 *   exists, one is created with a placeholder email (lib/utils/contact.ts) and
 *   the number recorded in server-only `app_metadata`.
 * - A session is then issued with an admin-generated magic-link token, so no
 *   password is ever set or overwritten — an earlier version overwrote the
 *   password on every phone login, which broke email/password sign-in for
 *   accounts that had both.
 */
export async function verifyPhoneOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOtpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const verified = await verifyVoiceOtp(parsed.data.phone, parsed.data.token);
  if (!verified.success) return { error: verified.error };

  const phone = normalizePhone(parsed.data.phone);
  const admin = createAdminClient();
  const supabase = await createClient();

  const existing = await prisma.user.findUnique({ where: { phone } });
  let email = existing?.email;

  if (!email) {
    email = phoneLoginEmail(phone);
    const { error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { phone, phone_verified: true },
    });
    // "already registered" = an earlier attempt created the auth user but the
    // app row wasn't written yet; carrying on to sign in is exactly right.
    if (error && !/already|registered|exists/i.test(error.message)) {
      console.error("Creating phone-login account failed:", error.message);
      return { error: "Could not sign you in. Please try again." };
    }
  }

  const { data, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !data) {
    console.error("Generating phone-login session failed:", linkError?.message);
    return { error: "Could not sign you in. Please try again." };
  }

  // Supabase rejects a token_hash accompanied by an email/phone — only these two.
  const { error } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });
  if (error) {
    console.error("Verifying phone-login session failed:", error.message);
    return { error: "Could not sign you in. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Adds a phone number to the *currently signed-in* account (account
 * settings "Add phone number", not the login flow) — sends the
 * confirmation code by voice call.
 */
export async function requestLinkPhoneAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const result = await sendVoiceOtp(parsed.data.phone);
  return result.success ? { success: true } : { error: result.error };
}

/**
 * On a correct voice-call code, records the verified phone on the signed-in
 * user's server-only `app_metadata` via the Admin API (we already did the real
 * verification ourselves). Supabase's own phone field is unused — see
 * verifyPhoneOtpAction — so "a verified phone can't be linked to multiple
 * accounts" is enforced here, with an explicit check against users.phone.
 */
export async function verifyLinkPhoneAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOtpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const verified = await verifyVoiceOtp(parsed.data.phone, parsed.data.token);
  if (!verified.success) return { error: verified.error };

  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again and retry." };

  const phone = normalizePhone(parsed.data.phone);
  const takenBy = await prisma.user.findFirst({
    where: { phone, id: { not: user.id } },
    select: { id: true },
  });
  if (takenBy) return { error: "We couldn't add this number. Please try a different one." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { phone, phone_verified: true },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Checkout step-up re-verification (see CheckoutView) — re-confirms
 * possession of the phone *already verified on the signed-in account*
 * before an order is placed. Deliberately separate from the login
 * actions above: no Supabase user mutation here, just a voice-call
 * send/verify gated on the phone matching this account's own.
 */
export async function requestCheckoutOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const user = await getCurrentUser();
  if (!user?.phoneVerified || !user.phone || normalizePhone(user.phone) !== normalizePhone(parsed.data.phone)) {
    return { error: "That doesn't match the phone number on your account." };
  }

  const result = await sendVoiceOtp(parsed.data.phone);
  return result.success ? { success: true } : { error: result.error };
}

export async function verifyCheckoutOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOtpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const user = await getCurrentUser();
  if (!user?.phoneVerified || !user.phone || normalizePhone(user.phone) !== normalizePhone(parsed.data.phone)) {
    return { error: "That doesn't match the phone number on your account." };
  }

  const result = await verifyVoiceOtp(parsed.data.phone, parsed.data.token);
  return result.success ? { success: true } : { error: result.error };
}

export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const parsed = emailOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password/confirm`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  // The old password's hash is already gone the moment updateUser() above
  // succeeds — Postgres has one encrypted_password column, overwritten in
  // place, nothing "old" lingers. What DOES survive a password change is
  // any session/JWT issued before it (tokens are stateless and keep working
  // until they expire on their own) — sign those out everywhere else so a
  // reset actually locks out anyone still signed in with the old password.
  await supabase.auth.signOut({ scope: "others" });

  revalidatePath("/", "layout");
  return { success: true };
}
