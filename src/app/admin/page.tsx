import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList, IndianRupee, ShoppingBag, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils/currency";
import {
  getDashboardStats,
  getRecentOrders,
  getSalesByDay,
  getTopProducts,
} from "@/lib/data/admin/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, salesByDay, topProducts, recentOrders] = await Promise.all([
    getDashboardStats(),
    getSalesByDay(14),
    getTopProducts(5),
    getRecentOrders(8),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Store performance at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue this month"
          value={formatCurrency(stats.thisMonthRevenue)}
          icon={IndianRupee}
          changePct={stats.revenueChangePct}
        />
        <StatCard label="Orders this month" value={String(stats.ordersThisMonth)} icon={ShoppingBag} />
        <StatCard label="Orders today" value={String(stats.ordersToday)} icon={ClipboardList} />
        <StatCard label="Total customers" value={String(stats.totalCustomers)} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
            Revenue — last 14 days
          </h2>
          <SalesChart data={salesByDay} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
            Top Products
          </h2>
          <ul className="flex flex-col gap-3">
            {topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            )}
            {topProducts.map((p, i) => (
              <li key={p.productName} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-semibold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{p.productName}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{p.quantitySold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {recentOrders.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
          )}
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
            >
              <div>
                <p className="font-medium text-foreground">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {order.user.fullName ?? order.user.email} ·{" "}
                  {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="tabular-nums font-medium text-foreground">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
