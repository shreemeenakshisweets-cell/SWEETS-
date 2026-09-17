import { BUSINESS } from "@/lib/business";

export function BrandStory() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
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
    </section>
  );
}
