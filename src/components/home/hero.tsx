"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bannerGradientStyle } from "@/lib/data/banner-themes";
import { cn } from "@/lib/utils";
import type { Banner } from "@/generated/prisma/client";

const trustPoints = [
  { icon: Leaf, label: "100% Pure Veg" },
  { icon: ShieldCheck, label: "FSSAI Certified" },
  { icon: Truck, label: "Pan-India Delivery" },
];

// Fallback content if no banners have been added yet in /admin/banners —
// keeps the homepage from shipping an empty hero on a fresh install.
const FALLBACK_SLIDE: Pick<
  Banner,
  "id" | "eyebrow" | "heading" | "body" | "ctaLabel" | "ctaHref" | "theme"
> = {
  id: "fallback",
  eyebrow: "Taste you'll love, hygiene you can trust",
  heading: "Authentic taste,\nuncompromising hygiene.",
  body: "Every sweet and savoury is made fresh in a certified, hygienic kitchen — pure ingredients, time-tested recipes, and the same care in every batch.",
  ctaLabel: "Order Now",
  ctaHref: "/menu",
  theme: "gold",
};

const AUTO_ADVANCE_MS = 4000;

export function Hero({ banners }: { banners: Banner[] }) {
  const slides = banners.length > 0 ? banners : [FALLBACK_SLIDE];
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[Math.min(index, slides.length - 1)];

  function goTo(i: number) {
    setIndex((i + slides.length) % slides.length);
  }

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[520px] w-full sm:h-[560px] lg:h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
            style={bannerGradientStyle(slide.theme)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />

            <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="max-w-lg"
              >
                {slide.eyebrow && (
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white uppercase backdrop-blur-sm">
                    {slide.eyebrow}
                  </span>
                )}
                <h1 className="mt-5 whitespace-pre-line font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl">
                  {slide.heading}
                </h1>
                <p className="mt-5 max-w-md text-base text-white/85 sm:text-lg">{slide.body}</p>
                <div className="mt-8">
                  <Button
                    size="lg"
                    render={<Link href={slide.ctaHref} />}
                    nativeButton={false}
                    className="gap-2"
                  >
                    {slide.ctaLabel} <ArrowRight className="size-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-6"
            >
              <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {trustPoints.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-foreground/80">
              <Icon className="size-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
