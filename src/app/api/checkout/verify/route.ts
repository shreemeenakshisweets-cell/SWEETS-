import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/auth";
import { verifyPaymentSchema } from "@/lib/validation/checkout";
import { createInvoiceForOrder } from "@/lib/data/admin/invoices";
import { redeemCouponIfAny } from "@/lib/data/coupon-validation";
import { sendOrderStatusEmail } from "@/lib/notifications/order-email";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
  }
  const {
    orderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = parsed.data;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const payment = order.payments[0];
  if (!payment || payment.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: "Payment does not match this order" }, { status: 400 });
  }

  const isValid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });

  if (!isValid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason: "Signature verification failed", razorpayPaymentId },
    });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  if (order.status === "PENDING") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId,
          razorpaySignature,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: "CONFIRMED", note: "Payment verified" },
      });

      for (const item of order.items) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await createInvoiceForOrder(tx, order);
      await redeemCouponIfAny(tx, order);
    });

    // Outside the transaction — network I/O, and must never block/fail the
    // response just because email delivery hiccups.
    await sendOrderStatusEmail(order.id, "CONFIRMED");
  }

  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
}
