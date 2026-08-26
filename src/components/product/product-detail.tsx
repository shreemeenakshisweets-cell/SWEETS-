"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Leaf, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductTagBadge } from "@/components/product/product-tag-badge";
import { ProductCard } from "@/components/product/product-card";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/catalog";

export function ProductDetail({
  product,
  category,
  related,
}: {
  product: Product;
  category: Category | undefined;
  related: Product[];
}) {
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    product.variants.find((v) => v.isDefault)?.id ?? product.variants[0].id
  );
  const [quantity, setQuantity] = React.useState(1);
  const [wishlisted, setWishlisted] = React.useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const discountPct = variant.compareAtPrice
    ? Math.round((1 - variant.price / variant.compareAtPrice) * 100)
    : 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image: product.images[0],
        variantId: variant.id,
        variantLabel: variant.label,
        unitPrice: variant.price,
        maxStock: variant.stock,
      },
      quantity
    );
    toast.success(`Added ${quantity} × ${product.name} (${variant.label}) to cart`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/menu" className="hover:text-primary">
          Menu
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/menu?category=${category.slug}`} className="hover:text-primary">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted"
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-cover"
          />
          <div className="absolute left-4 top-4 flex flex-col gap-1.5">
            {product.tags.map((tag) => (
              <ProductTagBadge key={tag} tag={tag} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col"
        >
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <RatingStars rating={product.ratingAverage} count={product.ratingCount} size="md" />
            <span className="text-sm text-muted-foreground">
              {product.isVeg ? "Pure Veg" : "Contains Egg"}
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator className="my-6" />

          <div>
            <span className="text-sm font-medium text-foreground">
              Select weight
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                    v.id === selectedVariantId
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-primary/50"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-heading text-3xl font-semibold text-foreground">
              {formatCurrency(variant.price)}
            </span>
            {variant.compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(variant.compareAtPrice)}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-1 rounded-xl border border-border px-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-8 text-center font-medium tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(variant.stock, q + 1))}
                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button size="lg" onClick={handleAdd} className="flex-1">
              Add to Cart — {formatCurrency(variant.price * quantity)}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setWishlisted((w) => !w);
                toast(wishlisted ? "Removed from wishlist" : "Added to wishlist");
              }}
              aria-pressed={wishlisted}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("size-4", wishlisted && "fill-accent text-accent")} />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-secondary/30 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Leaf className="size-4 text-primary" /> 100% Pure Veg
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <ShieldCheck className="size-4 text-primary" /> FSSAI Certified
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Truck className="size-4 text-primary" /> Pan-India Delivery
            </div>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
