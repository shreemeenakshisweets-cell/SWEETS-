"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
// TEMPORARY: voice-call codes until 2Factor's WhatsApp service is ready (see lib/twofactor.ts).
import { sendVoiceOtp, verifyVoiceOtp } from "@/lib/twofactor";
import { normalizePhone } from "@/lib/utils/phone";
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
 * On a correct voice-call code, bridges the verified phone into a real Supabase
 * session (via the service-role Admin API, since there's no native
 * phone-provider flow to lean on) — how depends on what's already on the
 * matching account:
 *
 * - Phone-only account (no email — e.g. first-ever sign-in with this
 *   number): give it a fresh single-use random password nobody ever sees,
 *   then sign in with it through the request-scoped client. Safe to
 *   overwrite on every login since nothing else depends on that password.
 * - Account with a real email (e.g. this phone was later linked to an
 *   existing email/password account under Account Settings): bridge in via
 *   an admin-generated magic-link token instead. This NEVER touches
 *   `password` — a previous bug used the same password-overwrite path for
 *   every account regardless, which silently broke email/password login
 *   for anyone who ever used "Continue with Phone Number" on an account
 *   that also signs in with email.
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

  if (existing?.email) {
    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: existing.email,
    });
    if (linkError || !data) return { error: linkError?.message ?? "Could not sign in." };

    const { error } = await supabase.auth.verifyOtp({
      email: existing.email,
      token_hash: data.properties.hashed_token,
      type: "magiclink",
    });
    if (error) return { error: error.message };
  } else {
    const tempPassword = randomBytes(24).toString("hex");
    if (existing) {
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        password: tempPassword,
      });
      if (error) return { error: error.message };
    } else {
      const { error } = await admin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        password: tempPassword,
      });
      if (error) return { error: error.message };
    }

    const { error } = await supabase.auth.signInWithPassword({ phone, password: tempPassword });
    if (error) return { error: error.message };
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
 * On a correct voice-call code, attaches the phone directly to the signed-in
 * user via the Admin API (phone_confirm: true — we already did the real
 * verification ourselves via the voice-call code). Supabase itself rejects this if the
 * phone is already confirmed on a *different* account, which is what
 * enforces "a verified phone can't be linked to multiple accounts."
 */
export async function verifyLinkPhoneAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOtpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const verified = await verifyVoiceOtp(parsed.data.phone, parsed.data.token);
  if (!verified.success) return { error: verified.error };

  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again and retry." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    phone: normalizePhone(parsed.data.phone),
    phone_confirm: true,
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
