import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { requireUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data/orders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Track Order ${orderNumber}` };
}

export default async function TrackOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireUser();
  const order = await getOrderForUser(orderNumber, user.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/orders/track"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="size-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {order.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.invoice && (
            <Link
              href={`/orders/${order.orderNumber}/invoice`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Invoice
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
            Status Timeline
          </h2>
          <OrderStatusTimeline currentStatus={order.status} history={order.statusHistory} />
        </section>

        <div className="flex flex-col gap-6">
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
            <p className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
            {order.deliveryInstructions && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                &ldquo;{order.deliveryInstructions}&rdquo;
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
              Order Items
            </h2>
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
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(Number(order.total))}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
