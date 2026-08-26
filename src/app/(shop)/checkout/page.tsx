import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <CheckoutView initialAddresses={addresses} customerEmail={user.email} />;
}
