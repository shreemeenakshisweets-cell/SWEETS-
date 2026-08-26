import "server-only";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["CONFIRMED", "PREPARING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export type ReportRange = "daily" | "weekly" | "monthly";

function periodKey(date: Date, range: ReportRange) {
  if (range === "daily") return date.toISOString().slice(0, 10);
  if (range === "monthly") return date.toISOString().slice(0, 7);

  // ISO week key: Monday-start week, e.g. 2026-W08
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function getSalesReport(range: ReportRange) {
  const since = new Date();
  if (range === "daily") since.setDate(since.getDate() - 30);
  else if (range === "weekly") since.setDate(since.getDate() - 7 * 12);
  else since.setMonth(since.getMonth() - 12);

  const orders = await prisma.order.findMany({
    where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const byPeriod = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    const key = periodKey(order.createdAt, range);
    const existing = byPeriod.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += Number(order.total);
    existing.orders += 1;
    byPeriod.set(key, existing);
  }

  return Array.from(byPeriod.entries())
    .map(([period, data]) => ({ period, ...data }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export async function getProductPerformance() {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: "desc" } },
  });

  return grouped.map((g) => ({
    productName: g.productName,
    quantitySold: g._sum.quantity ?? 0,
    revenue: Number(g._sum.total ?? 0),
  }));
}
