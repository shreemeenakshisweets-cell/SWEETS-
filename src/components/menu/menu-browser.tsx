"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/catalog";

type SortKey = "popularity" | "price-asc" | "price-desc" | "rating";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function defaultVariantPrice(product: Product) {
  return (product.variants.find((v) => v.isDefault) ?? product.variants[0]).price;
}

export function MenuBrowser({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = React.useState(searchParams.get("category") ?? "all");
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [sort, setSort] = React.useState<SortKey>("popularity");
  const [showFilters, setShowFilters] = React.useState(false);

  // Syncs local filter state from the URL (external system) so browser
  // back/forward and links elsewhere that set ?category=/?q= are reflected —
  // not a same-render derivation of local state.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setCategory(searchParams.get("category") ?? "all");
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function updateUrl(next: { category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextCategory = next.category ?? category;
    const nextQuery = next.q ?? query;

    if (nextCategory && nextCategory !== "all") params.set("category", nextCategory);
    else params.delete("category");

    if (nextQuery) params.set("q", nextQuery);
    else params.delete("q");

    router.replace(`/menu${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const filtered = React.useMemo(() => {
    let list = products;

    if (category !== "all") {
      list = list.filter((p) => p.categorySlug === category);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => defaultVariantPrice(a) - defaultVariantPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => defaultVariantPrice(b) - defaultVariantPrice(a));
        break;
      case "rating":
        sorted.sort((a, b) => b.ratingAverage - a.ratingAverage);
        break;
      default:
        sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
    return sorted;
  }, [products, category, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Our Menu
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {filtered.length} item{filtered.length === 1 ? "" : "s"} available
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              updateUrl({ q: e.target.value });
            }}
            placeholder="Search for sweets, savouries, gift boxes..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle category filters"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "mb-8 flex flex-wrap gap-2",
          "sm:flex",
          !showFilters && "hidden sm:flex"
        )}
      >
        <button
          onClick={() => {
            setCategory("all");
            updateUrl({ category: "all" });
          }}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            category === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategory(cat.slug);
              updateUrl({ category: cat.slug });
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === cat.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <X className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No products match your search. Try a different keyword or category.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setQuery("");
              setCategory("all");
              router.replace("/menu", { scroll: false });
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
