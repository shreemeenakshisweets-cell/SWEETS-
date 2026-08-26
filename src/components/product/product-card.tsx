"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductTagBadge } from "@/components/product/product-tag-badge";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  const variants = product.variants;
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    variants.find((v) => v.isDefault)?.id ?? variants[0].id
  );
  const [wishlisted, setWishlisted] = React.useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const discountPct = selectedVariant.compareAtPrice
    ? Math.round(
        (1 - selectedVariant.price / selectedVariant.compareAtPrice) * 100
      )
    : 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0],
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
      unitPrice: selectedVariant.price,
      maxStock: selectedVariant.stock,
    });
    toast.success(`Added ${product.name} (${selectedVariant.label}) to cart`);
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/menu/${product.slug}`} className="relative block h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <div className="flex flex-col gap-1">
            {product.tags[0] && <ProductTagBadge tag={product.tags[0]} />}
            {discountPct > 0 && (
              <Badge className="border-transparent bg-accent text-[0.65rem] font-medium text-accent-foreground">
                {discountPct}% off
              </Badge>
            )}
          </div>
          <button
            onClick={() => {
              setWishlisted((w) => !w);
              toast(wishlisted ? "Removed from wishlist" : "Added to wishlist");
            }}
            aria-label="Toggle wishlist"
            aria-pressed={wishlisted}
            className="flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-accent"
          >
            <Heart className={cn("size-4", wishlisted && "fill-accent text-accent")} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Link href={`/menu/${product.slug}`}>
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-foreground hover:text-primary sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {product.shortDescription}
        </p>
        <RatingStars rating={product.ratingAverage} count={product.ratingCount} />

        {variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                  v.id === selectedVariantId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className="font-heading text-base font-semibold text-foreground">
              {formatCurrency(selectedVariant.price)}
            </span>
            {selectedVariant.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(selectedVariant.compareAtPrice)}
              </span>
            )}
          </div>
          <Button size="sm" onClick={handleAdd} className="gap-1">
            <Plus className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
