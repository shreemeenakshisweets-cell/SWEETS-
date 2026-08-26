import "server-only";
import { prisma } from "@/lib/prisma";

export function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });
}

export function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
}

export function getAdminCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}
