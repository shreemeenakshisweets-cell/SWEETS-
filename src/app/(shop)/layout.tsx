import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
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
        <SiteHeader user={user} />
      </div>
      <main className="flex-1">{children}</main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}
