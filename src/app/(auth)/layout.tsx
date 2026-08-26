import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_55%),radial-gradient(circle_at_85%_85%,color-mix(in_oklch,var(--accent)_12%,transparent),transparent_50%)]"
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
