"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type ActionResult = { error?: string };

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const user = await requireUser();

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== user.id) {
    return { error: "Address not found." };
  }

  try {
    await prisma.address.delete({ where: { id: addressId } });
  } catch {
    return { error: "Could not delete this address." };
  }

  revalidatePath("/account/addresses");
  return {};
}

export async function setDefaultAddressAction(addressId: string): Promise<ActionResult> {
  const user = await requireUser();

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== user.id) {
    return { error: "Address not found." };
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  return {};
}
