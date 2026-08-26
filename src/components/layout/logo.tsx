import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 select-none",
        className
      )}
      aria-label="Shree Meenakshi Sweets & Savouries — home"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground font-heading text-base font-semibold shadow-sm transition-transform group-hover:scale-105 sm:size-10 sm:text-lg">
        SM
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-[0.65rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Shree
        </span>
        <span className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Meenakshi
        </span>
      </span>
    </Link>
  );
}
