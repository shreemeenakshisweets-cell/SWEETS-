import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { categories, products } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse our full range of traditional Indian sweets, savouries, gift boxes and beverages. Fresh, pure veg, delivered nationwide.",
};

function MenuSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuBrowser categories={categories} products={products} />
    </Suspense>
  );
}
