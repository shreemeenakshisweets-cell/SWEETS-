import type { Metadata } from "next";
import { CouponsManager } from "@/components/admin/coupons-manager";
import { getAdminCoupons } from "@/lib/data/admin/coupons";

export const metadata: Metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();
  return <CouponsManager coupons={coupons} />;
}
