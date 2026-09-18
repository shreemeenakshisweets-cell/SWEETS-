import type { Metadata } from "next";
import { HomepageContentManager } from "@/components/admin/homepage-content-manager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Homepage Content" };

export default async function AdminHomepageContentPage() {
  await requireAdmin();
  const content = await prisma.homepageContent.findUnique({ where: { id: "homepage" } });
  return (
    <HomepageContentManager
      brandStoryImageUrl={content?.brandStoryImageUrl ?? ""}
      brandStoryImageEnabled={content?.brandStoryImageEnabled ?? true}
    />
  );
}
