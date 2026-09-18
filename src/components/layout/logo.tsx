import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  hideTextOnMobile = false,
}: {
  className?: string;
  /** Hides the "Shree / Meenakshi / Sweets & Savouries" text stack below
   * the `sm` breakpoint, leaving just the mark — used in the compact top
   * header bar where the logo is centered and space is tight. */
  hideTextOnMobile?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex shrink-0 select-none items-center gap-2.5", className)}
      aria-label="Shree Meenakshi Sweets & Savouries — home"
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={1536}
        height={1024}
        priority
        className="h-11 w-auto transition-transform group-hover:scale-105 sm:h-12"
      />
      <span className={cn("flex-col leading-tight", hideTextOnMobile ? "hidden sm:flex" : "flex")}>
        <span className="font-heading text-[0.65rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Shree
        </span>
        <span className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Meenakshi
        </span>
        <span className="text-[0.62rem] font-bold tracking-wide text-primary sm:text-xs">
          Sweets &amp; Savouries
        </span>
      </span>
    </Link>
  );
}
