import type { ReactNode } from "react";
import Image from "next/image";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Kept deliberately faint (opacity-[0.22]) — this is decorative
          texture behind a login/signup form, not artwork to compete with it. */}
      <Image
        src="/backgrounds/auth-mobile.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-[0.22] sm:hidden"
      />
      <Image
        src="/backgrounds/auth-desktop.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 hidden object-cover opacity-[0.22] sm:block"
      />
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
