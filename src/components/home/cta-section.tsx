"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,white_15%,transparent),transparent_50%)]"
        />
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-4">
          <Gift className="size-9" />
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Planning a celebration?
          </h2>
          <p className="text-sm text-primary-foreground/85 sm:text-base">
            Order our festive gift boxes and hampers — curated assortments
            ready to ship anywhere in India, beautifully packaged.
          </p>
          <Button
            size="lg"
            variant="secondary"
            render={<Link href="/menu?category=gift-boxes" />}
            nativeButton={false}
            className="mt-2 gap-2"
          >
            Explore Gift Boxes <ArrowRight className="size-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
