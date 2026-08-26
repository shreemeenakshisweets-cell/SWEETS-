import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories, getAdminProductById } from "@/lib/data/admin/products";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">
        Edit {product.name}
      </h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
