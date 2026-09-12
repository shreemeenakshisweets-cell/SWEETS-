"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustPoints = [
  { icon: Leaf, label: "100% Pure Veg" },
  { icon: ShieldCheck, label: "FSSAI Certified" },
  { icon: Truck, label: "Pan-India Delivery" },
];

// Solid brand-colour gradients rather than placeholderImage() — that
// helper bakes its own text label into the image, which visually collided
// with the real heading overlaid on top of it here.
const slides = [
  {
    id: "brand",
    eyebrow: "Fresh, small-batch mithai",
    heading: "Traditional sweets,\ncrafted with devotion.",
    body: "Shree Meenakshi Sweets & Savouries brings authentic Indian mithai and namkeen to your door — made fresh with premium ingredients, no shortcuts.",
    ctaLabel: "Order Now",
    ctaHref: "/menu",
    gradient: "bg-[linear-gradient(120deg,#3d3108_0%,#8c6d1f_100%)]",
  },
  {
    id: "welcome",
    eyebrow: "New here?",
    heading: "Flat 10% off\nyour first order.",
    body: "Use code WELCOME10 at checkout and treat yourself to our signature sweets and savouries.",
    ctaLabel: "Shop Now",
    ctaHref: "/menu",
    gradient: "bg-[linear-gradient(120deg,#6b230f_0%,#b3401f_100%)]",
  },
  {
    id: "festive",
    eyebrow: "Festive gifting",
    heading: "Gift boxes for every\ncelebration.",
    body: "Curated hampers of sweets, savouries and dry fruits — free delivery on Gift Box orders above ₹999.",
    ctaLabel: "Explore Gift Boxes",
    ctaHref: "/menu?category=gift-boxes",
    gradient: "bg-[linear-gradient(120deg,#332804_0%,#7a6118_100%)]",
  },
];

const AUTO_ADVANCE_MS = 5500;

export function Hero() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = slides[index];

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
            className={cn("absolute inset-0", slide.gradient)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />

            <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                className="max-w-lg"
              >
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white uppercase backdrop-blur-sm">
                  {slide.eyebrow}
                </span>
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

        {/* Manual controls */}
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
