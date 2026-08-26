"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/types/catalog";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
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
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition-shadow hover:shadow-md"
            >
              <div className="relative size-16 overflow-hidden rounded-full border border-border sm:size-20">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-xs font-medium text-foreground sm:text-sm">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
