"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/currency";
import { BUSINESS } from "@/lib/business";

export interface InvoiceViewProps {
  invoiceNumber: string;
  issuedAt: Date;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  billingAddress: { line1: string; line2: string | null; city: string; state: string; postalCode: string };
  items: { productName: string; variantLabel: string; unitPrice: number; quantity: number; total: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export function InvoiceView(props: InvoiceViewProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex justify-end print:hidden">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="rounded-2xl border border-border p-8 print:rounded-none print:border-none print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              {BUSINESS.tradeName}
            </h1>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">{BUSINESS.address}</p>
            <p className="text-xs text-muted-foreground">GSTIN: {BUSINESS.gstin}</p>
            <p className="text-xs text-muted-foreground">FSSAI: {BUSINESS.fssai}</p>
          </div>
          <div className="text-right">
            <h2 className="font-heading text-lg font-semibold text-foreground">TAX INVOICE</h2>
            <p className="text-sm text-muted-foreground">Invoice #{props.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">Order #{props.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              {props.issuedAt.toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Billed To
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{props.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {props.billingAddress.line1}
              {props.billingAddress.line2 ? `, ${props.billingAddress.line2}` : ""},{" "}
              {props.billingAddress.city}, {props.billingAddress.state}{" "}
              {props.billingAddress.postalCode}
            </p>
            <p className="text-sm text-muted-foreground">{props.customer.phone}</p>
            <p className="text-sm text-muted-foreground">{props.customer.email}</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-right font-medium">Unit Price</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, i) => (
              <tr key={i} className="border-b border-border/60">
                <td className="py-2.5 text-foreground">
                  {item.productName}{" "}
                  <span className="text-muted-foreground">({item.variantLabel})</span>
                </td>
                <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="py-2.5 text-right tabular-nums text-foreground">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="flex w-full max-w-xs flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(props.subtotal)}</span>
            </div>
            {props.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCurrency(props.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="tabular-nums">
                {props.deliveryFee === 0 ? "Free" : formatCurrency(props.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST ({props.taxRate}%)</span>
              <span className="tabular-nums">{formatCurrency(props.taxAmount)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(props.total)}</span>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
}
