import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/data/admin/products";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
