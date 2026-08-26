"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { RatingStars } from "@/components/product/rating-stars";
import type { Testimonial } from "@/types/catalog";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="bg-secondary/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Loved by Customers
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Real words from people who ordered with us.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <Quote className="size-6 text-primary/40" />
              <RatingStars rating={t.rating} />
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-2">
                <div className="relative size-9 overflow-hidden rounded-full">
                  <Image src={t.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
