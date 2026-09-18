"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Toggles a product in/out of the signed-in user's wishlist. Returns an
 * `error` (rather than redirecting, like requireUser() would) so callers
 * on public catalog pages can show a toast instead of yanking a browsing
 * guest to /login.
 */
export async function toggleWishlistAction(
  productId: string
): Promise<{ wishlisted?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to save items to your wishlist." };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { wishlisted: false };
  }

  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
  return { wishlisted: true };
}
