"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { placeholderImage } from "@/lib/data/placeholder-image";

const trustPoints = [
  { icon: Leaf, label: "100% Pure Veg" },
  { icon: ShieldCheck, label: "FSSAI Certified" },
  { icon: Truck, label: "Pan-India Delivery" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%),radial-gradient(circle_at_85%_0%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_50%)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-secondary px-3.5 py-1.5 text-xs font-medium tracking-wide text-secondary-foreground uppercase">
            Fresh, small-batch mithai
          </span>
          <h1 className="mt-5 font-heading text-4xl leading-[1.08] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Traditional sweets,
            <br />
            <span className="text-primary">crafted with devotion.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
            Shree Meenakshi Sweets &amp; Savouries brings authentic Indian mithai
            and namkeen to your door — made fresh with premium ingredients,
            no shortcuts.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link href="/menu" />}
              nativeButton={false}
              className="gap-2"
            >
              Order Now <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/menu?category=gift-boxes" />}
              nativeButton={false}
            >
              Explore Gift Boxes
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-foreground/80">
                <Icon className="size-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <div className="absolute inset-4 rounded-[2.5rem] bg-primary/10 blur-2xl" />
          <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border shadow-xl">
            <Image
              src={placeholderImage("Festive Sweets Box", {
                size: 900,
                bg: "f3e7c3",
                fg: "4a3b0e",
              })}
              alt="Assorted Shree Meenakshi sweets and savouries"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 80vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:-left-8">
            <p className="font-heading text-lg font-semibold text-foreground">4.8/5</p>
            <p className="text-xs text-muted-foreground">from 900+ happy customers</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
