import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { getAdminCategories } from "@/lib/data/admin/products";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesManager categories={categories} />;
}
