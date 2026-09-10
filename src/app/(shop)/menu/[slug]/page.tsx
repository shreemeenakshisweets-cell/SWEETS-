import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/product-detail";
import {
  getAllProductSlugs,
  getCategoryBySlug,
  getProductBySlug,
  getProductsByCategory,
} from "@/lib/data/storefront";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [category, sameCategory] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getProductsByCategory(product.categorySlug),
  ]);
  const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetail product={product} category={category ?? undefined} related={related} />;
}
