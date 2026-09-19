"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categoryInputSchema } from "@/lib/validation/admin";
import { uploadImage } from "@/lib/supabase/storage";

type ActionResult = { id?: string; error?: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadCategoryImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be under 5MB" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.name, file.type, "categories");
    return { url };
  } catch (error) {
    console.error("Category image upload failed:", error);
    return { error: "Upload failed — please try again." };
  }
}

export async function saveCategoryAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category" };
  }
  const { id, ...fields } = parsed.data;

  try {
    const category = id
      ? await prisma.category.update({ where: { id }, data: fields })
      : await prisma.category.create({ data: fields });

    revalidatePath("/admin/categories");
    revalidatePath("/menu");
    return { id: category.id };
  } catch {
    return { error: "Could not save category — check the slug is unique." };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return { error: "Could not delete — this category still has products in it." };
  }
  revalidatePath("/admin/categories");
  return {};
}

export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.category.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/categories");
  revalidatePath("/menu");
  revalidatePath("/", "layout");
  return {};
}
