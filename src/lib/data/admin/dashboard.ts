import "server-only";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["CONFIRMED", "PREPARING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export async function getDashboardStats() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersToday,
    pendingOrders,
    totalCustomers,
    totalOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfThisMonth } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: [...PAID_STATUSES] },
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "PACKED"] } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
  ]);

  const thisMonthRevenue = Number(revenueThisMonth._sum.total ?? 0);
  const lastMonthRevenue = Number(revenueLastMonth._sum.total ?? 0);
  const revenueChangePct =
    lastMonthRevenue === 0 ? null : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  return {
    thisMonthRevenue,
    revenueChangePct,
    ordersThisMonth,
    ordersToday,
    pendingOrders,
    totalCustomers,
    totalOrders,
  };
}

/** Daily revenue for the last `days` days, oldest first — for the sales chart. */
export async function getSalesByDay(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
    select: { createdAt: true, total: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(order.total));
  }

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export async function getTopProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({
    productName: g.productName,
    quantitySold: g._sum.quantity ?? 0,
    revenue: Number(g._sum.total ?? 0),
  }));
}

export async function getRecentOrders(limit = 8) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: true, items: true },
  });
}
