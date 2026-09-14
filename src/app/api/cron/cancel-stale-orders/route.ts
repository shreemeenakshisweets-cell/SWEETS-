import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const STALE_AFTER_HOURS = 24;

/**
 * Not every abandoned checkout gets an explicit failure signal — a customer
 * who closes the tab mid-payment never triggers a signature-mismatch or a
 * Razorpay `payment.failed` webhook, so their Order would otherwise sit at
 * PENDING forever, indistinguishable in the admin orders list (and revenue
 * stats already exclude PENDING, so this is purely a list-hygiene cleanup).
 * Wired to run daily via vercel.json's `crons` config.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - STALE_AFTER_HOURS * 60 * 60 * 1000);
  const stale = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  for (const order of stale) {
    const pendingPayment = order.payments[0];
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          note: "Payment was never completed (abandoned checkout)",
        },
      }),
      ...(pendingPayment?.status === "PENDING"
        ? [
            prisma.payment.update({
              where: { id: pendingPayment.id },
              data: { status: "FAILED", failureReason: "Abandoned — payment never completed" },
            }),
          ]
        : []),
    ]);
  }

  return NextResponse.json({ cancelled: stale.length });
}
