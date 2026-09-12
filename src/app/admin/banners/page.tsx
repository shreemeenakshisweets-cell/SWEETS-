import type { Metadata } from "next";
import { BannersManager } from "@/components/admin/banners-manager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  await requireAdmin();
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return <BannersManager banners={banners} />;
}
