"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/catalog";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-secondary/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Customer Favourites
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Our most-loved sweets and savouries, chosen by you.
            </p>
          </div>
          <Button
            variant="ghost"
            render={<Link href="/menu" />}
            nativeButton={false}
            className="hidden gap-1 sm:inline-flex"
          >
            View all <ArrowRight className="size-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Button variant="outline" render={<Link href="/menu" />} nativeButton={false}>
            View all products
          </Button>
        </div>
      </div>
    </section>
  );
}
