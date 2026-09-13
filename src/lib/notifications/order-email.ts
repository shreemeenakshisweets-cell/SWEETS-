import "server-only";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { BUSINESS } from "@/lib/business";
import { formatCurrency } from "@/lib/utils/currency";
import type { NotificationType, OrderStatus } from "@/generated/prisma/client";

const BRAND = {
  primary: "#7a6118",
  cream: "#fdfbf5",
  border: "#e7dec8",
  text: "#241d12",
  muted: "#7a7060",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type EmailContent = { subject: string; heading: string; bodyHtml: string };

const CONTENT_BY_STATUS: Partial<Record<OrderStatus, (orderNumber: string) => EmailContent>> = {
  CONFIRMED: (orderNumber) => ({
    subject: `Order Confirmed — ${orderNumber}`,
    heading: "Your order is confirmed! 🎉",
    bodyHtml: `<p>Thank you for your order — we've received your payment and we're getting started on it.</p>`,
  }),
  OUT_FOR_DELIVERY: (orderNumber) => ({
    subject: `Out for Delivery — ${orderNumber}`,
    heading: "Your order is on its way!",
    bodyHtml: `<p>Your order has left our kitchen and is out for delivery. It should reach you soon.</p>`,
  }),
  DELIVERED: (orderNumber) => ({
    subject: `Delivered — ${orderNumber}`,
    heading: "Your order has been delivered",
    bodyHtml: `<p>We hope you enjoy it! If anything's off, just reply to this email and we'll make it right.</p>`,
  }),
  CANCELLED: (orderNumber) => ({
    subject: `Order Cancelled — ${orderNumber}`,
    heading: "Your order was cancelled",
    bodyHtml: `<p>Your order has been cancelled. If a payment was made, any applicable refund will be processed shortly.</p>`,
  }),
};

/** Maps an OrderStatus to the Notification model's type enum for the audit row. */
const NOTIFICATION_TYPE_BY_STATUS: Partial<Record<OrderStatus, NotificationType>> = {
  CONFIRMED: "ORDER_CONFIRMED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "ORDER_CANCELLED",
};

function renderEmailHtml(content: EmailContent, orderNumber: string, itemsHtml: string, total: string) {
  return `
<div style="background:${BRAND.cream};padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.text};">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
    <div style="background:${BRAND.primary};padding:20px 24px;">
      <p style="margin:0;color:#fffbef;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${BUSINESS.tradeName}</p>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="margin:0 0 12px;font-size:20px;">${content.heading}</h1>
      ${content.bodyHtml}
      <p style="margin:20px 0 4px;font-size:13px;color:${BRAND.muted};">Order ${orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
        ${itemsHtml}
      </table>
      <p style="margin:16px 0 0;font-weight:600;font-size:15px;">Total: ${total}</p>
      <a href="${siteUrl}/orders/${orderNumber}/track"
         style="display:inline-block;margin-top:24px;background:${BRAND.primary};color:#fffbef;text-decoration:none;padding:10px 20px;border-radius:10px;font-size:14px;">
        Track your order
      </a>
    </div>
    <div style="padding:16px 24px;border-top:1px solid ${BRAND.border};font-size:11px;color:${BRAND.muted};">
      ${BUSINESS.tradeName} · ${BUSINESS.address}<br/>
      GSTIN ${BUSINESS.gstin} · FSSAI ${BUSINESS.fssai}
    </div>
  </div>
</div>`;
}

/**
 * Sends the customer-facing status email for an order (best-effort — never
 * throws, so a Resend outage can't break checkout or admin status updates)
 * and records a Notification row for the in-app/audit history.
 */
export async function sendOrderStatusEmail(orderId: string, status: OrderStatus) {
  const contentFn = CONTENT_BY_STATUS[status];
  const notificationType = NOTIFICATION_TYPE_BY_STATUS[status];
  if (!contentFn || !notificationType) return;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true, shippingAddress: true },
    });
    if (!order) return;

    const content = contentFn(order.orderNumber);
    const itemsHtml = order.items
      .map(
        (item) => `<tr>
          <td style="padding:4px 0;color:${BRAND.text};">${item.productName} (${item.variantLabel}) × ${item.quantity}</td>
          <td style="padding:4px 0;text-align:right;color:${BRAND.muted};">${formatCurrency(Number(item.total))}</td>
        </tr>`
      )
      .join("");
    const html = renderEmailHtml(content, order.orderNumber, itemsHtml, formatCurrency(Number(order.total)));

    if (process.env.RESEND_API_KEY) {
      await getResend().emails.send({
        from: `${BUSINESS.tradeName} <${process.env.RESEND_FROM_EMAIL || "orders@resend.dev"}>`,
        to: order.user.email,
        subject: content.subject,
        html,
      });
    }

    if (status === "CONFIRMED") {
      const itemsText = order.items
        .map((item) => `• ${item.productName} (${item.variantLabel}) × ${item.quantity}`)
        .join("\n");
      await sendWhatsAppMessage(
        order.shippingAddress.phone,
        `Hi ${order.shippingAddress.fullName}! 🎉 Your order *${order.orderNumber}* is confirmed.\n\n${itemsText}\n\nTotal: *${formatCurrency(Number(order.total))}*\n\nTrack it here: ${siteUrl}/orders/${order.orderNumber}/track\n\nThank you for shopping with ${BUSINESS.tradeName}!`
      );
    }

    await prisma.notification.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        type: notificationType,
        channel: "EMAIL",
        title: content.subject,
        message: content.heading,
        sentAt: process.env.RESEND_API_KEY ? new Date() : null,
      },
    });
  } catch (error) {
    console.error(`Failed to send order status email (order ${orderId}, status ${status}):`, error);
  }
}

/**
 * Alerts the business inbox (BUSINESS.email) that a new paid order has come
 * in — separate from sendOrderStatusEmail, which is the customer-facing
 * message. Best-effort, same as above: never throws, so an email outage
 * can't break checkout.
 */
export async function notifyBusinessOfNewOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true, shippingAddress: true },
    });
    if (!order || !process.env.RESEND_API_KEY) return;

    const itemsHtml = order.items
      .map(
        (item) => `<tr>
          <td style="padding:4px 0;color:${BRAND.text};">${item.productName} (${item.variantLabel}) × ${item.quantity}</td>
          <td style="padding:4px 0;text-align:right;color:${BRAND.muted};">${formatCurrency(Number(item.total))}</td>
        </tr>`
      )
      .join("");

    const html = `
<div style="background:${BRAND.cream};padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.text};">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
    <div style="background:${BRAND.primary};padding:20px 24px;">
      <p style="margin:0;color:#fffbef;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">New Order</p>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="margin:0 0 12px;font-size:20px;">Order ${order.orderNumber}</h1>
      <p style="margin:0 0 4px;font-size:14px;"><strong>${order.shippingAddress.fullName}</strong> · ${order.shippingAddress.phone}</p>
      <p style="margin:0 0 16px;font-size:13px;color:${BRAND.muted};">
        ${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${itemsHtml}
      </table>
      <p style="margin:16px 0 0;font-weight:600;font-size:15px;">Total: ${formatCurrency(Number(order.total))}</p>
      <a href="${siteUrl}/admin/orders/${order.id}"
         style="display:inline-block;margin-top:24px;background:${BRAND.primary};color:#fffbef;text-decoration:none;padding:10px 20px;border-radius:10px;font-size:14px;">
        View in Admin
      </a>
    </div>
  </div>
</div>`;

    await getResend().emails.send({
      from: `${BUSINESS.tradeName} <${process.env.RESEND_FROM_EMAIL || "orders@resend.dev"}>`,
      to: BUSINESS.email,
      subject: `New order — ${order.orderNumber} (${formatCurrency(Number(order.total))})`,
      html,
    });

    const itemsText = order.items
      .map((item) => `• ${item.productName} (${item.variantLabel}) × ${item.quantity}`)
      .join("\n");
    await sendWhatsAppMessage(
      BUSINESS.whatsapp,
      `🔔 New order *${order.orderNumber}*\n\n${order.shippingAddress.fullName} · ${order.shippingAddress.phone}\n${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}\n\n${itemsText}\n\nTotal: *${formatCurrency(Number(order.total))}*\n\nView: ${siteUrl}/admin/orders/${order.id}`
    );
  } catch (error) {
    console.error(`Failed to notify business of new order ${orderId}:`, error);
  }
}
