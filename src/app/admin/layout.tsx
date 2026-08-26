import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border lg:block print:hidden">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AdminSidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <AdminTopbar />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
