import Image from "next/image";

/**
 * A wide divider strip (height = width / 3) between the hero and the trust
 * badges — the classical-dance/palm-tree artwork on the left blending into
 * the same damask pattern used site-wide, via a soft mask-image fade
 * rather than a hard edge.
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
    </section>
  );
}
