"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { requestOtpAction, verifyOtpAction } from "@/app/(auth)/actions";
import { emailOnlySchema, otpVerifySchema } from "@/lib/validation/auth";

export function OtpForm() {
  const router = useRouter();
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailOnlySchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setLoading(true);
    const result = await requestOtpAction(parsed.data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("We sent a 6-digit code to your email");
    setStep("code");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const parsed = otpVerifySchema.safeParse({ email, token: code });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const result = await verifyOtpAction(parsed.data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Signed in successfully");
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Sign in with OTP
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "email"
            ? "We'll email you a one-time 6-digit code."
            : `Enter the code sent to ${email}`}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
            {loading ? "Verifying..." : "Verify & Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-center text-xs text-muted-foreground hover:text-primary"
          >
            Use a different email
          </button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Prefer a password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
