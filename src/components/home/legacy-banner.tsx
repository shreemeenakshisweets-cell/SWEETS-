import Image from "next/image";
import { BUSINESS } from "@/lib/business";

/**
 * A wide divider strip (height = width / 3) between the hero and the trust
 * badges — the classical-dance/palm-tree artwork on the left blending into
 * the same damask pattern used site-wide, via a soft mask-image fade
 * rather than a hard edge. The brand copy sits in the faded-in area on the
 * right so that space reads as intentional rather than empty.
 */
export function LegacyBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f2e6cf]" style={{ aspectRatio: "3 / 1" }}>
      <Image
        src="/backgrounds/dancers.png"
        alt="Classical South Indian dance figures — a nod to the tradition behind our recipes"
        fill
        sizes="100vw"
        className="object-cover object-left"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/backgrounds/pattern.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "min(18vw, 160px) auto",
          maskImage: "linear-gradient(to right, transparent 35%, black 75%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 35%, black 75%)",
        }}
      />

      <div className="absolute inset-y-0 right-0 hidden w-3/5 items-center justify-center px-6 text-center lg:flex xl:w-1/2 xl:px-12">
        <p className="text-lg leading-relaxed font-medium text-foreground/90 xl:text-xl">
          At {BUSINESS.tradeName}, every delicacy is a celebration of
          cherished traditions, authentic flavours, and timeless
          craftsmanship. Inspired by generations of culinary heritage, our
          sweets and savouries are lovingly prepared using carefully
          selected ingredients and trusted recipes that have stood the
          test of time. From festive indulgences to everyday moments of
          joy, we bring you the warmth, richness, and elegance of true
          Indian taste—crafted to be shared, remembered, and treasured.
        </p>
      </div>
    </section>
  );
}
