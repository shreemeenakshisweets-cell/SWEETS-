import { prisma } from "@/lib/prisma";
import { placeholderImage } from "@/lib/data/placeholder-image";
import type { Category, Product, ProductTag } from "@/types/catalog";

const productInclude = {
  category: true,
  variants: { orderBy: { price: "asc" as const } },
};

type ProductWithRelations = Awaited<
  ReturnType<typeof prisma.product.findFirstOrThrow<{ include: typeof productInclude }>>
>;

function mapCategory(c: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? placeholderImage(c.name),
  };
}

function mapProduct(p: ProductWithRelations): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categorySlug: p.category.slug,
    shortDescription: p.description,
    description: p.description,
    images: p.images.length > 0 ? p.images : [placeholderImage(p.name)],
    isVeg: p.isVeg,
    isFeatured: p.isFeatured,
    tags: p.tags as ProductTag[],
    ratingAverage: Number(p.ratingAverage),
    ratingCount: p.ratingCount,
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      weightGrams: v.weightGrams ?? undefined,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      sku: v.sku,
      stock: v.stock,
      isDefault: v.isDefault,
    })),
  };
}

/** Active categories, in admin-configured display order. */
export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return categories.map(mapCategory);
}

/** Active products with at least one variant, newest first. */
export async function getActiveProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, variants: { some: {} }, category: { isActive: true } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      variants: { some: {} },
      category: { isActive: true },
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, category: { isActive: true } },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, variants: { some: {} }, category: { slug: categorySlug } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  return category ? mapCategory(category) : null;
}

/** Active homepage banners, in admin-configured display order. */
export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** All active product slugs, for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}
