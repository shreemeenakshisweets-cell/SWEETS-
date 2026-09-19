import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { placeholderImage } from "@/lib/data/placeholder-image";
import type { Category, Product, ProductReview, ProductTag, Testimonial } from "@/types/catalog";

/**
 * Tag on every cached public-catalog query below. Admin edits call
 * `updateTag(CATALOG_TAG)` (see the admin server actions) so changes show up
 * immediately; the 2-minute `revalidate` is only a safety net (e.g. stock
 * drifting after an order is paid, which happens in a route handler).
 */
export const CATALOG_TAG = "catalog";

/**
 * These queries return the same data for every visitor, but ran against the
 * database on every single page view — several sequential round trips each
 * (nested includes cost one per level) plus a cold connection on serverless.
 * Results are JSON-serialised in the cache, so only return plain data (the
 * mappers below already turn Decimals into numbers).
 */
function cachedQuery<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, [`storefront:${name}`], { tags: [CATALOG_TAG], revalidate: 120 });
}

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
    ingredients: p.ingredients ?? undefined,
    nutritionInfo: p.nutritionInfo ?? undefined,
    shelfLife: p.shelfLife ?? undefined,
    storageInfo: p.storageInfo ?? undefined,
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
export const getCategories = cachedQuery("categories", async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return categories.map(mapCategory);
});

/** Active products with at least one variant, newest first. */
export const getActiveProducts = cachedQuery("active-products", async (): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true, variants: { some: {} }, category: { isActive: true } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
});

export const getFeaturedProducts = cachedQuery("featured-products", async (): Promise<Product[]> => {
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
});

export const getProductBySlug = cachedQuery("product-by-slug", async (slug: string): Promise<Product | null> => {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, category: { isActive: true } },
    include: productInclude,
  });
  return product ? mapProduct(product) : null;
});

export const getProductsByCategory = cachedQuery("products-by-category", async (categorySlug: string): Promise<Product[]> => {
  const products = await prisma.product.findMany({
    where: { isActive: true, variants: { some: {} }, category: { slug: categorySlug } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
});

export const getCategoryBySlug = cachedQuery("category-by-slug", async (slug: string): Promise<Category | null> => {
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  return category ? mapCategory(category) : null;
});

/** Active homepage banners, in admin-configured display order. */
export const getActiveBanners = cachedQuery("active-banners", async () => {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
});

/** One-off homepage content (currently just the brand-story artwork). */
export const getHomepageContent = cachedQuery("homepage-content", async () => {
  return prisma.homepageContent.findUnique({ where: { id: "homepage" } });
});

/** Product IDs the given user has wishlisted — cheap set for card hearts. */
export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return items.map((i) => i.productId);
}

/** Full product details for a user's wishlist, newest-saved first. */
export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: "desc" },
  });
  return items.map((i) => mapProduct(i.product));
}

/** All active product slugs, for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}

/**
 * Real, approved customer reviews for the homepage testimonials section —
 * never fabricated placeholder quotes. Requires written feedback (not just
 * a star rating) and returns an empty array until there's enough of it;
 * the homepage hides the whole section rather than show fewer than 3.
 */
export const getFeaturedTestimonials = cachedQuery("featured-testimonials", async (): Promise<Testimonial[]> => {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true, rating: { gte: 4 }, comment: { not: null } },
    include: { user: true, order: { include: { shippingAddress: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return reviews.map((r) => {
    const name = r.user.fullName ?? "Verified Customer";
    return {
      id: r.id,
      name,
      location: r.order?.shippingAddress.city ?? "",
      rating: r.rating,
      quote: r.comment!,
      avatarUrl: r.user.avatarUrl ?? placeholderImage(name.slice(0, 2).toUpperCase(), { size: 128 }),
    };
  });
});

/** "Priya Sharma" -> "Priya S." — enough to feel real without exposing a full name. */
function reviewerDisplayName(fullName: string | null): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Verified Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** Approved reviews for a product page, newest first. */
export const getProductReviews = cachedQuery("product-reviews", async (productId: string): Promise<ProductReview[]> => {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? "",
    author: reviewerDisplayName(r.user.fullName),
    createdAt: r.createdAt.toISOString(),
  }));
});
