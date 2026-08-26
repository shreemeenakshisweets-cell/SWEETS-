"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { couponInputSchema } from "@/lib/validation/admin";

type ActionResult = { id?: string; error?: string };

export async function saveCouponAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = couponInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon" };
  }
  const { id, startsAt, expiresAt, ...fields } = parsed.data;
  const data = {
    ...fields,
    startsAt: startsAt ? new Date(startsAt) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  };

  try {
    const coupon = id
      ? await prisma.coupon.update({ where: { id }, data })
      : await prisma.coupon.create({ data });

    revalidatePath("/admin/coupons");
    return { id: coupon.id };
  } catch {
    return { error: "Could not save coupon — check the code is unique." };
  }
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return {};
}

export async function toggleCouponActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  return {};
}
