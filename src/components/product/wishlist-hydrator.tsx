"use client";

import * as React from "react";
import { useWishlistStore } from "@/lib/store/wishlist-store";

/** Seeds the wishlist store once per page load — renders nothing. */
export function WishlistHydrator({ ids }: { ids: string[] }) {
  const hydrate = useWishlistStore((s) => s.hydrate);
  // Array identity changes every request (new server render); joining to a
  // string keeps this from re-hydrating (and briefly resetting local
  // optimistic toggles) on every unrelated re-render of the layout.
  const key = ids.join(",");
  React.useEffect(() => {
    hydrate(key ? key.split(",") : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
