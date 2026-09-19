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
      {/* logo-mark.png is the badge cropped tight to its edges (the original
          artwork has ~20% transparent padding), so it fills the bar height
          instead of floating small inside it. `sizes` matters: without it
          next/image assumed full-width and fetched a 3840px, ~550KB variant
          for a ~100px-wide logo on every page. */}
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={640}
        height={368}
        sizes="112px"
        priority
        className={cn(
          "w-auto transition-transform group-hover:scale-105",
          hideTextOnMobile ? "h-15 sm:h-14" : "h-12 sm:h-14"
        )}
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
