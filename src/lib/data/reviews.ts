import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// An order counts as a purchase once it's confirmed — not while pending
// payment, and not if it was cancelled.
const PURCHASED_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

/** Most recent qualifying order for this user containing the product, if any. */
export async function findPurchaseOrderId(
  userId: string,
  productId: string
): Promise<string | null> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: { in: [...PURCHASED_STATUSES] },
      items: { some: { productId } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  return order?.id ?? null;
}

export type ReviewAccess =
  | { state: "signed-out" }
  | { state: "not-purchased" }
  | { state: "can-review"; existing: { rating: number; comment: string } | null };

/** What the current visitor may do on a product's review form. */
export async function getReviewAccess(productId: string): Promise<ReviewAccess> {
  const user = await getCurrentUser();
  if (!user) return { state: "signed-out" };

  const orderId = await findPurchaseOrderId(user.id, productId);
  if (!orderId) return { state: "not-purchased" };

  const existing = await prisma.review.findFirst({
    where: { userId: user.id, productId },
    select: { rating: true, comment: true },
  });
  return {
    state: "can-review",
    existing: existing ? { rating: existing.rating, comment: existing.comment ?? "" } : null,
  };
}
