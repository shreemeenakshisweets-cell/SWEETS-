import { NextResponse, type NextRequest } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { createInvoiceForOrder } from "@/lib/data/admin/invoices";
import { redeemCouponIfAny } from "@/lib/data/coupon-validation";
import { sendOrderStatusEmail } from "@/lib/notifications/order-email";

/**
 * Server-to-server durability fallback for payment confirmation, in case the
 * client never returns to call /api/checkout/verify (closed tab, network
 * drop, etc). Configure this URL + RAZORPAY_WEBHOOK_SECRET in the Razorpay
 * Dashboard for the `payment.captured` and `payment.failed` events.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const isValid = Razorpay.validateWebhookSignature(
    rawBody,
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET!
  );
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const paymentEntity = event?.payload?.payment?.entity;
  const razorpayOrderId: string | undefined = paymentEntity?.order_id;
  const razorpayPaymentId: string | undefined = paymentEntity?.id;

  if (!razorpayOrderId) {
    return NextResponse.json({ received: true });
  }

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId },
    orderBy: { createdAt: "desc" },
    include: { order: { include: { items: true } } },
  });
  if (!payment) {
    return NextResponse.json({ received: true });
  }

  if (event.event === "payment.captured" && payment.order.status === "PENDING") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", razorpayPaymentId, verifiedAt: new Date() },
      });
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "CONFIRMED" } });
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: "CONFIRMED",
          note: "Payment confirmed via webhook",
        },
      });
      for (const item of payment.order.items) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await createInvoiceForOrder(tx, payment.order);
      await redeemCouponIfAny(tx, payment.order);
    });

    await sendOrderStatusEmail(payment.orderId, "CONFIRMED");
  } else if (event.event === "payment.failed" && payment.status === "PENDING") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        razorpayPaymentId,
        failureReason: paymentEntity?.error_description ?? "Payment failed",
      },
    });
  }

  return NextResponse.json({ received: true });
}
