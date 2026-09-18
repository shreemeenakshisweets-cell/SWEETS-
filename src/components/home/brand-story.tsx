import Image from "next/image";
import { BUSINESS } from "@/lib/business";

const DEFAULT_IMAGE_URL = "/backgrounds/dancer-motif.png";

export function BrandStory({
  imageUrl,
  imageEnabled = true,
}: {
  /** Admin-uploaded override from /admin/homepage-content; falls back to
   * the artwork that ships with the site when unset. */
  imageUrl?: string;
  imageEnabled?: boolean;
}) {
  return (
    <section className="bg-secondary/40">
      <div
        className={
          imageEnabled
            ? "mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 text-center sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:text-left"
            : "mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8"
        }
      >
        <div>
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">
            Welcome to {BUSINESS.tradeName}
          </span>
          <h2 className="mt-3 font-heading text-3xl leading-[1.15] font-semibold text-foreground sm:text-4xl">
            Tradition in every bite,
            <br />
            trust in every batch.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Every sweet and savoury leaving our Vijayawada kitchen is made the
            way it always should be — real ghee, real ingredients, and
            recipes passed down rather than shortcuts taken. No preservatives,
            no compromises, just the same care in every single batch, whether
            it&apos;s a small treat for yourself or a festive order for the
            whole family.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We&apos;re a licensed, FSSAI-certified kitchen, and we stand
            behind everything we send out — fresh, hygienic, and delivered
            with the same pride we&apos;d want on our own table.
          </p>
        </div>

        {/* Transparent-background artwork — no card, no mask, just the PNG's
            own alpha channel so it sits directly on the section background.
            Padded a size smaller than its box (rather than filling it edge-
            to-edge) so the watercolor's own ragged border reads as bleeding
            into the page instead of looking clipped by the frame, and a
            drop-shadow (which follows the alpha silhouette, not a hard box)
            gives the figure some lift off the background. Admin-editable at
            /admin/homepage-content — imageUrl/imageEnabled come from there. */}
        {imageEnabled && (
          <div className="relative mx-auto w-full max-w-[220px] py-6 sm:max-w-xs lg:max-w-md">
            <div className="relative aspect-[736/916] w-[85%] mx-auto">
              <Image
                src={imageUrl || DEFAULT_IMAGE_URL}
                alt="Traditional South Indian classical dancer, a nod to the heritage behind our recipes"
                fill
                sizes="(min-width: 1024px) 340px, (min-width: 640px) 260px, 190px"
                className="object-contain drop-shadow-[0_30px_25px_rgba(74,44,20,0.25)]"
              />
            </div>
            <div className="mx-auto h-3 w-2/5 rounded-[50%] bg-black/15 blur-md" />
          </div>
        )}
      </div>
    </section>
  );
}
