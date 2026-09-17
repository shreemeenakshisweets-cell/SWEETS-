"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toE164 } from "@/lib/utils/phone";
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
 * Sends an OTP to sign in (or, for a brand-new number, sign up) with a
 * phone number — Supabase finds-or-creates by phone the same way its
 * email OTP does, so a phone that's already linked to an account just
 * logs that account in, and an unrecognized one creates a fresh account.
 * Also reused, unmodified, as the checkout step-up re-verification (see
 * CheckoutView) — the phone there already belongs to the signed-in user,
 * so verifying it just re-confirms the same session.
 */
export async function requestPhoneOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: toE164(parsed.data.phone),
    options: { shouldCreateUser: true },
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function verifyPhoneOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOtpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: toE164(parsed.data.phone),
    token: parsed.data.token,
    type: "sms",
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Adds a phone number to the *currently signed-in* account (account
 * settings "Add phone number", not the login flow) — sends the
 * confirmation OTP to it. Supabase rejects this outright if the phone is
 * already verified on a different account, which is what enforces "a
 * verified phone can't be linked to multiple accounts."
 */
export async function requestLinkPhoneAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOnlySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ phone: toE164(parsed.data.phone) });
  if (error) return { error: error.message };
  return { success: true };
}

export async function verifyLinkPhoneAction(input: unknown): Promise<ActionResult> {
  const parsed = phoneOtpVerifySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: toE164(parsed.data.phone),
    token: parsed.data.token,
    type: "phone_change",
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
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

  revalidatePath("/", "layout");
  return { success: true };
}
