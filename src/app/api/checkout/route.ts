import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/auth";
import { checkoutRequestSchema } from "@/lib/validation/checkout";
import { validateCoupon } from "@/lib/data/coupon-validation";
import { computeOrderTotals } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/order-number";

/**
 * Creates a pending Order (with authoritative, DB-verified pricing) and a
 * matching Razorpay order. Never trusts prices/totals sent by the client.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { items, addressId, deliveryInstructions, couponCode } = parsed.data;

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 400 });
  }

  const skus = items.map((i) => i.sku);
  const variants = await prisma.productVariant.findMany({
    where: { sku: { in: skus } },
    include: { product: true },
  });

  if (variants.length !== skus.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available" },
      { status: 400 }
    );
  }

  const orderItemsData: {
    productId: string;
    variantId: string;
    productName: string;
    variantLabel: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const variant = variants.find((v) => v.sku === item.sku)!;
    if (!variant.product.isActive) {
      return NextResponse.json(
        { error: `${variant.product.name} is currently unavailable` },
        { status: 400 }
      );
    }
    if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stock} left of ${variant.product.name} (${variant.label})` },
        { status: 400 }
      );
    }
    const price = Number(variant.price);
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    orderItemsData.push({
      productId: variant.productId,
      variantId: variant.id,
      productName: variant.product.name,
      variantLabel: variant.label,
      unitPrice: price,
      quantity: item.quantity,
      total: lineTotal,
    });
  }

  let discount = 0;
  let couponId: string | null = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal, user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    discount = result.discount;
    couponId = result.coupon.id;
  }

  const totals = computeOrderTotals(subtotal, discount, items.length);
  const orderNumber = generateOrderNumber();

  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totals.total * 100),
      currency: "INR",
      receipt: orderNumber,
      notes: { orderNumber, userId: user.id },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 }
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        shippingAddressId: address.id,
        deliveryInstructions: deliveryInstructions || null,
        couponId,
        subtotal: totals.subtotal,
        discount: totals.discount,
        deliveryFee: totals.deliveryFee,
        taxAmount: totals.taxAmount,
        total: totals.total,
        items: { create: orderItemsData },
      },
    });

    await tx.payment.create({
      data: {
        orderId: created.id,
        razorpayOrderId: razorpayOrder.id,
        amount: totals.total,
        status: "PENDING",
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: created.id, status: "PENDING", note: "Order placed, awaiting payment" },
    });

    return created;
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    customer: {
      name: address.fullName,
      email: user.email,
      contact: address.phone,
    },
  });
}
