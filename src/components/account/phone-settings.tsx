"use client";

import * as React from "react";
import { Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { requestLinkPhoneAction, verifyLinkPhoneAction } from "@/app/(auth)/actions";
import { phoneOnlySchema, phoneOtpVerifySchema } from "@/lib/validation/auth";
import { fromE164 } from "@/lib/utils/phone";

const RESEND_SECONDS = 30;

export function PhoneSettings({
  currentPhone,
  phoneVerified,
}: {
  currentPhone: string | null;
  phoneVerified: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState(currentPhone ? fromE164(currentPhone) : "");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  async function sendCode() {
    const parsed = phoneOnlySchema.safeParse({ phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid phone number");
      return false;
    }
    setLoading(true);
    const result = await requestLinkPhoneAction(parsed.data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    toast.success("We sent a 6-digit code to your phone");
    setResendIn(RESEND_SECONDS);
    return true;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (await sendCode()) setStep("code");
  }

  async function handleResend() {
    if (resendIn > 0 || loading) return;
    await sendCode();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const parsed = phoneOtpVerifySchema.safeParse({ phone, token: code });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const result = await verifyLinkPhoneAction(parsed.data);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Phone number verified");
    setEditing(false);
    setStep("phone");
    setCode("");
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-5">
        <Phone className="size-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {currentPhone ? `+91 ${fromE164(currentPhone)}` : "No phone number added"}
          </p>
          <p className="text-xs text-muted-foreground">
            {phoneVerified
              ? "Verified — used for phone sign-in and checkout confirmation"
              : currentPhone
                ? "Not yet verified"
                : "Add a phone number to sign in with OTP and speed up checkout"}
          </p>
        </div>
        {phoneVerified && <ShieldCheck className="size-4 shrink-0 text-primary" />}
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          {currentPhone ? "Change" : "Add"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-3">
          <Label htmlFor="link-phone">Mobile Number</Label>
          <div className="flex items-center gap-2">
            <span className="flex h-8 items-center rounded-lg border border-input bg-background px-2.5 text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="link-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send code"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Enter the code sent to +91 {phone}</p>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={loading || code.length < 6}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendIn > 0 || loading}
              className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
