import Link from "next/link";
import type { Metadata } from "next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { getAdminOrders } from "@/lib/data/admin/orders";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Orders" };

const STATUS_FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "All" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Packed", value: "PACKED" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status as OrderStatus | undefined;
  const page = Number(sp.page) || 1;
  const { orders, total, pageCount } = await getAdminOrders({ status, page });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">{total} orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              status === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:text-primary">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.user.fullName ?? order.user.email}
                </TableCell>
                <TableCell className="text-muted-foreground">{order.items.length}</TableCell>
                <TableCell className="tabular-nums text-foreground">
                  {formatCurrency(Number(order.total))}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/orders?${status ? `status=${status}&` : ""}page=${i + 1}`}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-sm",
                page === i + 1
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
