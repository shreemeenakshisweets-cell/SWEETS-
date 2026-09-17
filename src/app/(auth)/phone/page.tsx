import { Suspense } from "react";
import type { Metadata } from "next";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";

export const metadata: Metadata = { title: "Continue with Phone Number" };

export default function PhoneLoginPage() {
  return (
    <Suspense>
      <PhoneOtpForm />
    </Suspense>
  );
}
