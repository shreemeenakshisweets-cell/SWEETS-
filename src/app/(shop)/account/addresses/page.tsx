import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { AddressManager } from "@/components/account/address-manager";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Saved Addresses" };

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Saved Addresses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage delivery addresses for faster checkout.
          </p>
        </div>
        <Button variant="ghost" render={<Link href="/account" />} nativeButton={false}>
          Back to account
        </Button>
      </div>

      <div className="mt-8">
        <AddressManager addresses={addresses} />
      </div>
    </div>
  );
}
