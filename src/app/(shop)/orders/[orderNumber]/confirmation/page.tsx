import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { requireUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireUser();
  const order = await getOrderForUser(orderNumber, user.id);
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="size-14 text-primary" />
      <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">
        {order.status === "CONFIRMED" ? "Order Confirmed!" : "Order Received"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Thank you! Your order <span className="font-medium text-foreground">{order.orderNumber}</span>{" "}
        has been {order.status === "CONFIRMED" ? "confirmed" : "placed"}. We&apos;ll notify you as
        it moves through preparation and delivery.
      </p>

      <div className="mt-8 w-full rounded-2xl border border-border p-6 text-left">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-sm text-muted-foreground">Order Number</span>
          <span className="font-medium text-foreground">{order.orderNumber}</span>
        </div>
        <ul className="mt-3 flex flex-col divide-y divide-border">
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
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total Paid</span>
          <span className="tabular-nums">{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button render={<Link href={`/orders/${order.orderNumber}/track`} />} nativeButton={false} size="lg">
          Track Order
        </Button>
        <Button
          render={<Link href={`/orders/${order.orderNumber}/invoice`} />}
          nativeButton={false}
          variant="outline"
          size="lg"
        >
          Download Invoice
        </Button>
        <Button render={<Link href="/menu" />} nativeButton={false} variant="ghost" size="lg">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
