import "server-only";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getAdminOrders({ status, page = 1 }: { status?: OrderStatus; page?: number }) {
  const where: Prisma.OrderWhereInput = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: true, items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, pageSize: PAGE_SIZE, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: true,
      shippingAddress: true,
      payments: { orderBy: { createdAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      invoice: true,
    },
  });
}
