"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { requestPhoneOtpAction, verifyPhoneOtpAction } from "@/app/(auth)/actions";
import { phoneOnlySchema, phoneOtpVerifySchema } from "@/lib/validation/auth";

const RESEND_SECONDS = 30;

export function PhoneOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";

  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  async function sendCode(phoneValue: string) {
    const parsed = phoneOnlySchema.safeParse({ phone: phoneValue });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid phone number");
      return false;
    }
    setLoading(true);
    const result = await requestPhoneOtpAction(parsed.data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    toast.success("Calling you now — answer to hear your 6-digit code");
    setResendIn(RESEND_SECONDS);
    return true;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (await sendCode(phone)) setStep("code");
  }

  async function handleResend() {
    if (resendIn > 0 || loading) return;
    await sendCode(phone);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const parsed = phoneOtpVerifySchema.safeParse({ phone, token: code });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const result = await verifyPhoneOtpAction(parsed.data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Signed in successfully");
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Continue with Phone Number
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "phone"
            ? "We'll call you with a one-time 6-digit code."
            : `Enter the 6-digit code from the call to +91 ${phone}`}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp-phone">Mobile Number</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-8 items-center rounded-lg border border-input bg-background px-2.5 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="otp-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Sending..." : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" size="lg" disabled={loading || code.length < 6}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendIn > 0 || loading}
              className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {resendIn > 0 ? `Call again in ${resendIn}s` : "Call me again"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
            }}
            className="text-center text-xs text-muted-foreground hover:text-primary"
          >
            Use a different number
          </button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Prefer email?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
