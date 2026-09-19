"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Search, ShoppingBag, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cartItemCount, useCartStore } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";
import type { User as AppUser } from "@/generated/prisma/client";

/**
 * App-style bottom tab bar shown only on small screens (the header's own
 * nav/search/account affordances take over at `lg`, matching the shop
 * reference this was modeled on). Fixed, so ShopLayout pads `main` with
 * `pb-16` on mobile to keep it from covering page content.
 */
export function MobileBottomNav({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const items = useCartStore((s) => s.items);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);
  const cartCount = mounted ? cartItemCount(items) : 0;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(query.trim() ? `/menu?q=${encodeURIComponent(query.trim())}` : "/menu");
    setQuery("");
  }

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/menu"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
            isActive("/menu") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LayoutGrid className="size-5" />
          Shop
        </Link>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <Search className="size-5" />
          Search
        </button>
        <Link
          href={user ? "/account" : "/login"}
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
            isActive(user ? "/account" : "/login") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <UserIcon className="size-5" />
          Account
        </Link>
        <Link
          href="/cart"
          className={cn(
            "relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
            isActive("/cart") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <span className="relative">
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-accent text-[0.6rem] font-semibold text-accent-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </span>
          Cart
        </Link>
      </nav>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-24 max-w-[calc(100%-2rem)] -translate-y-0 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sweets, savouries..."
              aria-label="Search products"
              className="text-sm"
            />
            <Button type="submit" size="icon" aria-label="Search">
              <Search className="size-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
