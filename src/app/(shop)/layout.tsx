import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getCurrentUser } from "@/lib/auth";

export default async function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      <div className="print:hidden">
        <TopBar />
        <SiteHeader user={user} />
      </div>
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <div className="print:hidden">
        <SiteFooter />
        <MobileBottomNav user={user} />
      </div>
    </>
  );
}
