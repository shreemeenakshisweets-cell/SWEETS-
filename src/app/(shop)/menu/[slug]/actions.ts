"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/data/storefront";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { findPurchaseOrderId } from "@/lib/data/reviews";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5, "Choose a star rating"),
  comment: z
    .string()
    .trim()
    .max(1000, "Please keep your review under 1000 characters")
    .optional()
    .or(z.literal("")),
});

type ActionResult = { error?: string; success?: true };

/**
 * Creates (or updates) the signed-in customer's review of a product. Limited to
 * customers who've actually ordered it, so ratings and the homepage testimonials
 * stay genuine; one review per customer per product, editable afterwards.
 */
export async function submitReviewAction(input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  const { productId, rating, comment } = parsed.data;

  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to leave a review." };

  const orderId = await findPurchaseOrderId(user.id, productId);
  if (!orderId) return { error: "Only customers who have ordered this product can review it." };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) return { error: "Product not found." };

  const existing = await prisma.review.findFirst({
    where: { userId: user.id, productId },
    select: { id: true },
  });

  try {
    await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.review.update({
          where: { id: existing.id },
          data: { rating, comment: comment || null, orderId },
        });
      } else {
        await tx.review.create({
          data: { productId, userId: user.id, orderId, rating, comment: comment || null },
        });
      }

      // Keep the denormalised rating on the product (used by cards) in step.
      const agg = await tx.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await tx.product.update({
        where: { id: productId },
        data: {
          ratingAverage: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          ratingCount: agg._count.rating,
        },
      });
    });
  } catch (error) {
    console.error("Saving review failed:", error);
    return { error: "Could not save your review. Please try again." };
  }

  revalidatePath(`/menu/${product.slug}`);
  updateTag(CATALOG_TAG);
  revalidatePath("/");
  return { success: true };
}
