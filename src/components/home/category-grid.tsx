"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/types/catalog";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Shop by Category
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            From festive mithai to everyday snacking.
          </p>
        </div>
        <Link href="/menu" className="hidden text-sm font-medium text-primary hover:underline sm:block">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              href={`/menu?category=${category.slug}`}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/40 p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg sm:p-5"
            >
              {/* Soft warm glow behind the medallion, blooming in on hover
                  — plain circular thumbnails read flat against the page,
                  this gives each category a bit of festive sparkle. */}
              <div className="absolute top-2 size-20 rounded-full bg-primary/25 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-primary/35 sm:size-24" />

              <div className="relative rounded-full bg-gradient-to-br from-primary via-accent to-primary p-[3px] shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <div className="relative size-16 overflow-hidden rounded-full border-2 border-background sm:size-20">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              <span className="relative text-xs font-semibold text-foreground sm:text-sm">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
