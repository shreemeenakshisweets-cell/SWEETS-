import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "About Us",
  description: `The story behind ${BUSINESS.tradeName} — traditional Indian sweets and savouries made fresh in Vijayawada.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        About {BUSINESS.tradeName}
      </h1>

      <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          {BUSINESS.tradeName} has been serving Vijayawada with authentic Indian sweets and
          savouries, made the traditional way — small batches, premium ingredients, and recipes
          passed down rather than shortcuts taken. Every box that leaves our kitchen is made
          fresh to order, not pulled off a shelf.
        </p>
        <p>
          From classic mithai like Kaju Katli and Mysore Pak to crunchy namkeen and festive gift
          boxes, our goal is simple: bring the taste of a proper Indian sweet shop to your door,
          anywhere in the country.
        </p>
        <p>
          We&apos;re a licensed, GST-registered food business (FSSAI Lic. No. {BUSINESS.fssai},
          GSTIN {BUSINESS.gstin}), based in Vijayawada, Andhra Pradesh, and every order — whether
          it&apos;s a small treat for yourself or a large festive order for family — gets the same
          care.
        </p>
        <p>
          Have a question, a bulk order, or a custom request? We&apos;d love to hear from you —
          reach out any time through our{" "}
          <a href="/contact" className="text-primary underline underline-offset-2">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
