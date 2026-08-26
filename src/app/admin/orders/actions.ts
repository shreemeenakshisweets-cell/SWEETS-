"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { orderStatusUpdateSchema } from "@/lib/validation/admin";

type ActionResult = { error?: string };

export async function updateOrderStatusAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = orderStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid status update" };
  }
  const { orderId, status, note } = parsed.data;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
        ...(status === "CANCELLED" ? { cancelledAt: new Date(), cancelReason: note || null } : {}),
      },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId, status, note: note || null },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}
