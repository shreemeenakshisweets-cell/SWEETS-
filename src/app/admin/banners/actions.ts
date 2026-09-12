"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { bannerInputSchema } from "@/lib/validation/admin";

type ActionResult = { id?: string; error?: string };

export async function saveBannerAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = bannerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid banner" };
  }
  const { id, ...fields } = parsed.data;
  const data = { ...fields, eyebrow: fields.eyebrow || null };

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
