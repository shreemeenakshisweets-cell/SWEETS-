"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { Promotion } from "@/types/catalog";

function copyCode(code: string) {
  navigator.clipboard?.writeText(code).then(() => toast.success(`Copied code ${code}`));
}

export function Promotions({ promotions }: { promotions: Promotion[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="mb-8 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Offers &amp; Promotions
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {promotions.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative flex min-h-44 items-center overflow-hidden rounded-2xl border border-border"
          >
            <Image
              src={promo.imageUrl}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2 p-6 text-white">
              <h3 className="font-heading text-xl font-semibold">{promo.title}</h3>
              <p className="max-w-xs text-sm text-white/85">{promo.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <Link
                  href={promo.ctaHref}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/90"
                >
                  Shop Now
                </Link>
                <button
                  onClick={() => copyCode(promo.code)}
                  className="flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                >
                  {promo.code} <Copy className="size-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
