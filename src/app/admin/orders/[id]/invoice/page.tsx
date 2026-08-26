import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InvoiceView } from "@/components/orders/invoice-view";
import { getAdminOrderById } from "@/lib/data/admin/orders";

export const metadata: Metadata = { title: "Invoice" };

export default async function AdminOrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order || !order.invoice) notFound();

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
