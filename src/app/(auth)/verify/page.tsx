import type { Metadata } from "next";
import { OtpForm } from "@/components/auth/otp-form";

export const metadata: Metadata = { title: "Sign In with OTP" };

export default function VerifyPage() {
  return <OtpForm />;
}
