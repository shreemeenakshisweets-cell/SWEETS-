import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 select-none items-center", className)}
      aria-label="Shree Meenakshi Sweets & Savouries — home"
    >
      <Image
        src="/brand/logo.png"
        alt="Shree Meenakshi Sweets & Savouries"
        width={1536}
        height={1024}
        priority
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  );
}
