import "server-only";
import { prisma } from "@/lib/prisma";

export function getAdminCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}
