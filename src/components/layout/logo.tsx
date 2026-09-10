import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
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
