"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productInputSchema } from "@/lib/validation/admin";

type ActionResult = { id?: string; error?: string };

export async function saveProductAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }
  const { id, variants, ...fields } = parsed.data;

  try {
    if (id) {
      const existing = await prisma.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((v) => v.id));
      const incomingIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));
      const toDelete = [...existingIds].filter((vid) => !incomingIds.has(vid));

      await prisma.$transaction([
        prisma.product.update({ where: { id }, data: fields }),
        ...toDelete.map((vid) => prisma.productVariant.delete({ where: { id: vid } })),
        ...variants.map((v) =>
          v.id
            ? prisma.productVariant.update({
                where: { id: v.id },
                data: {
                  label: v.label,
                  weightGrams: v.weightGrams,
                  price: v.price,
                  compareAtPrice: v.compareAtPrice,
                  sku: v.sku,
                  stock: v.stock,
                  isDefault: v.isDefault,
                },
              })
            : prisma.productVariant.create({
                data: {
                  productId: id,
                  label: v.label,
                  weightGrams: v.weightGrams,
                  price: v.price,
                  compareAtPrice: v.compareAtPrice,
                  sku: v.sku,
                  stock: v.stock,
                  isDefault: v.isDefault,
                },
              })
        ),
      ]);

      revalidatePath("/admin/products");
      return { id };
    }

    const product = await prisma.product.create({
      data: {
        ...fields,
        variants: {
          create: variants.map((v) => ({
            label: v.label,
            weightGrams: v.weightGrams,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            sku: v.sku,
            stock: v.stock,
            isDefault: v.isDefault,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    return { id: product.id };
  } catch {
    return { error: "Could not save product — check the slug and SKUs are unique." };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return { error: "Could not delete product." };
  }
  revalidatePath("/admin/products");
  return {};
}

export async function toggleProductActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  return {};
}
