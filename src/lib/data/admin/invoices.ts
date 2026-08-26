import "server-only";
import type { Prisma } from "@/generated/prisma/client";

function financialYearLabel(date: Date) {
  const year = date.getFullYear();
  const isAfterApril = date.getMonth() >= 3; // month is 0-indexed; 3 = April
  const startYear = isAfterApril ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

/**
 * Creates the Invoice row for a just-confirmed order, using a
 * transaction-scoped sequential count for a GST-style serial number
 * (SM/2026-27/00001). Call inside the same $transaction that confirms the
 * order, and only once per order (callers should check `order.invoice` is
 * still null first).
 */
export async function createInvoiceForOrder(
  tx: Prisma.TransactionClient,
  order: { id: string; subtotal: Prisma.Decimal | number; taxAmount: Prisma.Decimal | number; total: Prisma.Decimal | number }
) {
  const now = new Date();
  const fy = financialYearLabel(now);
  const countThisYear = await tx.invoice.count({
    where: { invoiceNumber: { startsWith: `SM/${fy}/` } },
  });
  const invoiceNumber = `SM/${fy}/${String(countThisYear + 1).padStart(5, "0")}`;

  const subtotal = Number(order.subtotal);
  const taxAmount = Number(order.taxAmount);

  return tx.invoice.create({
    data: {
      orderId: order.id,
      invoiceNumber,
      gstin: "37ARPPB5539B2ZU",
      subtotal,
      taxRate: subtotal > 0 ? Math.round((taxAmount / subtotal) * 10000) / 100 : 0,
      taxAmount,
      total: Number(order.total),
    },
  });
}
