import Link from "next/link";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { requireUser } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/data/storefront";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();
  const products = await getWishlistProducts(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Products you&apos;ve saved for later.
          </p>
        </div>
        <Button variant="ghost" render={<Link href="/account" />} nativeButton={false}>
          Back to account
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
          <Heart className="size-8 text-muted-foreground" />
          <p className="font-medium text-foreground">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any product to save it here.
          </p>
          <Button render={<Link href="/menu" />} nativeButton={false} className="mt-2">
            Browse the menu
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
