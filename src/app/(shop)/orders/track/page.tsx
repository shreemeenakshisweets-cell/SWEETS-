import Link from "next/link";
import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { requireUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Your Orders" };

export default async function TrackOrderPage() {
  const user = await requireUser();
  const orders = await getOrdersForUser(user.id);

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
        <PackageSearch className="size-10 text-primary" />
        <h1 className="font-heading text-2xl font-semibold text-foreground">No orders yet</h1>
        <p className="text-sm text-muted-foreground">
          Once you place an order, you&apos;ll be able to track its status here.
        </p>
        <Link href="/menu" className="text-sm font-medium text-primary hover:underline">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Your Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {orders.length} order{orders.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.orderNumber}/track`}
            className="flex flex-col gap-3 rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading text-base font-semibold text-foreground">
                  {order.orderNumber}
                </p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })} ·{" "}
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">
              {formatCurrency(Number(order.total))}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
