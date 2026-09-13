"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { bannerInputSchema } from "@/lib/validation/admin";
import { uploadImage } from "@/lib/supabase/storage";

type ActionResult = { id?: string; error?: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadBannerImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 5MB" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.name, file.type, "banners");
    return { url };
  } catch (error) {
    console.error("Banner image upload failed:", error);
    return { error: "Upload failed — please try again." };
  }
}

export async function saveBannerAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = bannerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid banner" };
  }
  const { id, ...fields } = parsed.data;
  const data = { ...fields, eyebrow: fields.eyebrow || null, imageUrl: fields.imageUrl || null };

  try {
    const banner = id
      ? await prisma.banner.update({ where: { id }, data })
      : await prisma.banner.create({ data });

    revalidatePath("/admin/banners");
    revalidatePath("/", "layout");
    return { id: banner.id };
  } catch {
    return { error: "Could not save banner." };
  }
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.banner.delete({ where: { id } });
  } catch {
    return { error: "Could not delete banner." };
  }
  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
  return {};
}

export async function toggleBannerActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.banner.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
  return {};
}
