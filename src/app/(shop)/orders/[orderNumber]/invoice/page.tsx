import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { InvoiceView } from "@/components/orders/invoice-view";
import { requireUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data/orders";

export const metadata: Metadata = { title: "Invoice" };

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireUser();
  const order = await getOrderForUser(orderNumber, user.id);
  if (!order) notFound();

  if (!order.invoice) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
        <FileText className="size-10 text-primary" />
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Invoice not available yet
        </h1>
        <p className="text-sm text-muted-foreground">
          Your invoice will appear here once payment for this order is confirmed.
        </p>
      </div>
    );
  }

  return (
    <InvoiceView
      invoiceNumber={order.invoice.invoiceNumber}
      issuedAt={order.invoice.issuedAt}
      orderNumber={order.orderNumber}
      customer={{
        name: order.shippingAddress.fullName,
        email: order.user.email,
        phone: order.shippingAddress.phone,
      }}
      billingAddress={order.shippingAddress}
      items={order.items.map((i) => ({
        productName: i.productName,
        variantLabel: i.variantLabel,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        total: Number(i.total),
      }))}
      subtotal={Number(order.invoice.subtotal)}
      discount={Number(order.discount)}
      deliveryFee={Number(order.deliveryFee)}
      taxRate={Number(order.invoice.taxRate)}
      taxAmount={Number(order.invoice.taxAmount)}
      total={Number(order.invoice.total)}
    />
  );
}
