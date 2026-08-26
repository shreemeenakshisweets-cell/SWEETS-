import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { validateCoupon } from "@/lib/data/coupon-validation";

const bodySchema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to apply a coupon" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await validateCoupon(parsed.data.code, parsed.data.subtotal, user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    code: result.coupon.code,
    label: result.coupon.description || result.coupon.code,
    discount: result.discount,
  });
}
