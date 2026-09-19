"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/data/storefront";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { homepageContentInputSchema } from "@/lib/validation/admin";
import { uploadImage } from "@/lib/supabase/storage";

const HOMEPAGE_CONTENT_ID = "homepage";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function uploadHomepageImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 15MB" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.name, file.type, "homepage");
    return { url };
  } catch (error) {
    console.error("Homepage image upload failed:", error);
    return { error: "Upload failed — please try again." };
  }
}

export async function saveHomepageContentAction(
  input: unknown
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = homepageContentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { brandStoryImageUrl, brandStoryImageEnabled } = parsed.data;
  const data = { brandStoryImageUrl: brandStoryImageUrl || null, brandStoryImageEnabled };

  try {
    await prisma.homepageContent.upsert({
      where: { id: HOMEPAGE_CONTENT_ID },
      update: data,
      create: { id: HOMEPAGE_CONTENT_ID, ...data },
    });
  } catch {
    return { error: "Could not save homepage content." };
  }

  revalidatePath("/admin/homepage-content");
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  return {};
}
