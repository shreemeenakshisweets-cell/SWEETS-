"use client";

import { create } from "zustand";

interface WishlistState {
  ids: Set<string>;
  hydrate: (ids: string[]) => void;
  setWishlisted: (productId: string, wishlisted: boolean) => void;
}

/**
 * In-memory only (no persist middleware) — this mirrors server state, not
 * local guest data like the cart store. It's seeded once per page load by
 * <WishlistHydrator> from the signed-in user's real wishlist_items rows, so
 * every ProductCard on the page reflects the same state without each one
 * fetching its own status.
 */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: new Set(),
  hydrate: (ids) => set({ ids: new Set(ids) }),
  setWishlisted: (productId, wishlisted) => {
    const next = new Set(get().ids);
    if (wishlisted) next.add(productId);
    else next.delete(productId);
    set({ ids: next });
  },
}));
