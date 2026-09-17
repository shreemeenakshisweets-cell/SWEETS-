import Image from "next/image";
import { BUSINESS } from "@/lib/business";

/**
 * Sourced from the same "classical-dance.jpg" already approved and live as
 * a hero banner photo (src/lib/data/storefront.ts / admin-managed banners)
 * — reused here rather than uploading a new asset.
 */
const IMAGE_URL =
  "https://mhyeittyesfrzgdixtit.supabase.co/storage/v1/object/public/product-images/banners/cff6d480-1ea2-43a6-84b6-9c119fb8b98a-classical-dance.jpg";

export function BrandStory() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative order-2 aspect-4/5 overflow-hidden rounded-3xl border border-border lg:order-1">
          <Image
            src={IMAGE_URL}
            alt="Traditional South Indian classical dance costume, a nod to the heritage behind our recipes"
            fill
            sizes="(min-width: 1024px) 480px, 90vw"
            className="object-cover saturate-[1.1]"
          />
        </div>

        <div className="order-1 lg:order-2">
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
      </div>
    </section>
  );
}
