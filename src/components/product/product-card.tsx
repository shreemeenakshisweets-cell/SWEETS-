"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductTagBadge } from "@/components/product/product-tag-badge";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { toggleWishlistAction } from "@/app/(shop)/account/wishlist/actions";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

const subscribeNever = () => () => {};

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const variants = product.variants;
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    variants.find((v) => v.isDefault)?.id ?? variants[0].id
  );
  const wishlisted = useWishlistStore((s) => s.ids.has(product.id));
  const setWishlisted = useWishlistStore((s) => s.setWishlisted);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItems = useCartStore((s) => s.items);
  // The cart persists to localStorage, so the server render never has items —
  // hold off on showing quantities until mounted to avoid a hydration mismatch.
  const mounted = React.useSyncExternalStore(subscribeNever, () => true, () => false);

  async function handleToggleWishlist() {
    const next = !wishlisted;
    setWishlisted(product.id, next); // optimistic
    const result = await toggleWishlistAction(product.id);
    if (result.error) {
      setWishlisted(product.id, !next); // revert
      toast.error(result.error);
      return;
    }
    toast(next ? "Added to wishlist" : "Removed from wishlist");
  }

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const inCartQty = mounted
    ? (cartItems.find((i) => i.variantId === selectedVariant.id)?.quantity ?? 0)
    : 0;
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
      sku: selectedVariant.sku,
      variantLabel: selectedVariant.label,
      unitPrice: selectedVariant.price,
      maxStock: selectedVariant.stock,
    });
    toast.success(`Added ${product.name} (${selectedVariant.label}) to cart`, {
      action: { label: "View Cart", onClick: () => router.push("/cart") },
    });
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
            className="object-cover saturate-[1.12] contrast-[1.04] transition-transform duration-500 group-hover:scale-105"
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
            onClick={handleToggleWishlist}
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

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-2 pt-2">
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
          {inCartQty > 0 ? (
            <div className="flex items-center rounded-full border border-primary/40 bg-primary/5">
              <button
                type="button"
                onClick={() => updateQuantity(selectedVariant.id, inCartQty - 1)}
                aria-label={`Decrease ${product.name} quantity`}
                className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-5 text-center text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
                {inCartQty}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(selectedVariant.id, inCartQty + 1)}
                disabled={inCartQty >= selectedVariant.stock}
                aria-label={`Increase ${product.name} quantity`}
                className="flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <Button size="sm" onClick={handleAdd} className="gap-1">
              <Plus className="size-3.5" /> Add
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
