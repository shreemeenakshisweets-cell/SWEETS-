"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { addressInputSchema } from "@/lib/validation/checkout";
import type { Address } from "@/generated/prisma/client";

type ActionResult = { address?: Address; error?: string };

export async function createAddressAction(input: unknown): Promise<ActionResult> {
  const parsed = addressInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const user = await requireUser();
  const data = parsed.data;

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      type: data.type,
      fullName: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      isDefault: data.isDefault,
    },
  });

  return { address };
}
