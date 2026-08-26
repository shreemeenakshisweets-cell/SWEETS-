import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordConfirmPage() {
  return <NewPasswordForm />;
}
