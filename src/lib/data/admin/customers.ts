import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdminCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { orders: { select: { id: true, total: true, status: true } } },
  });

  return customers.map((c) => ({
    ...c,
    orderCount: c.orders.length,
    totalSpent: c.orders
      .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING")
      .reduce((sum, o) => sum + Number(o.total), 0),
  }));
}

export function getAdminCustomerById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: true,
    },
  });
}
