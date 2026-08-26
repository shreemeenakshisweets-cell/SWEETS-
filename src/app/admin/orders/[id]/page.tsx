import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { formatCurrency } from "@/lib/utils/currency";
import { getAdminOrderById } from "@/lib/data/admin/orders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  return { title: order ? `Order ${order.orderNumber}` : "Order" };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.invoice && (
            <Link
              href={`/admin/orders/${order.id}/invoice`}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <FileText className="size-4" /> Invoice
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
              Customer
            </h2>
            <p className="text-sm text-foreground">
              {order.user.fullName ?? "—"} · {order.user.email}
            </p>
            {order.user.phone && <p className="text-sm text-muted-foreground">{order.user.phone}</p>}
            <Link
              href={`/admin/customers/${order.user.id}`}
              className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
            >
              View customer profile
            </Link>
          </section>

          <section className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
              Delivery Address
            </h2>
            <p className="text-sm text-foreground">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
            {order.deliveryInstructions && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                &ldquo;{order.deliveryInstructions}&rdquo;
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">Items</h2>
            <ul className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-foreground">
                    {item.productName} ({item.variantLabel}) × {item.quantity}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(Number(item.total))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="tabular-nums">{formatCurrency(Number(order.deliveryFee))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </section>

          {order.payments.length > 0 && (
            <section className="rounded-2xl border border-border p-5">
              <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
                Payments
              </h2>
              <ul className="flex flex-col gap-2">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {p.razorpayPaymentId ?? p.razorpayOrderId ?? "—"}
                    </span>
                    <span className="text-foreground">{p.status}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
              Update Status
            </h2>
            <OrderStatusControl orderId={order.id} currentStatus={order.status} />
          </section>

          <section className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
              Status History
            </h2>
            <OrderStatusTimeline currentStatus={order.status} history={order.statusHistory} />
          </section>
        </div>
      </div>
    </div>
  );
}
