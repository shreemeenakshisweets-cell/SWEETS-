import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { WishlistHydrator } from "@/components/product/wishlist-hydrator";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/data/storefront";

export default async function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const wishlistIds = user ? await getWishlistProductIds(user.id) : [];

  return (
    <div className="theme-pattern-bg flex min-h-full flex-1 flex-col">
      <WishlistHydrator ids={wishlistIds} />
      <div className="print:hidden">
        <TopBar />
        <SiteHeader user={user} />
      </div>
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <div className="print:hidden">
        <SiteFooter />
        <MobileBottomNav user={user} />
      </div>
    </div>
  );
}
