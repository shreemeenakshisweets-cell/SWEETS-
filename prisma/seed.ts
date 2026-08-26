/**
 * Seeds the database from the static demo catalog (src/lib/data/catalog.ts)
 * so checkout can validate carts against real Product/ProductVariant rows.
 * Run with `npx prisma db seed` (or automatically after `prisma migrate dev`).
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categories, products } from "../src/lib/data/catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding ${categories.length} categories...`);
  const categoryIdBySlug = new Map<string, string>();

  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
      },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }

  console.log(`Seeding ${products.length} products...`);
  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug "${product.categorySlug}" for product ${product.slug}`);
    }

    const productRow = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId,
        name: product.name,
        description: product.description,
        images: product.images,
        isVeg: product.isVeg,
        isFeatured: product.isFeatured ?? false,
        tags: product.tags,
        ratingAverage: product.ratingAverage,
        ratingCount: product.ratingCount,
      },
      create: {
        categoryId,
        slug: product.slug,
        name: product.name,
        description: product.description,
        images: product.images,
        isVeg: product.isVeg,
        isFeatured: product.isFeatured ?? false,
        tags: product.tags,
        ratingAverage: product.ratingAverage,
        ratingCount: product.ratingCount,
      },
    });

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: productRow.id,
          label: variant.label,
          weightGrams: variant.weightGrams,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          stock: variant.stock,
          isDefault: variant.isDefault ?? false,
        },
        create: {
          productId: productRow.id,
          sku: variant.sku,
          label: variant.label,
          weightGrams: variant.weightGrams,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          stock: variant.stock,
          isDefault: variant.isDefault ?? false,
        },
      });
    }
  }

  console.log("Seeding demo coupons...");
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "PERCENTAGE",
      value: 10,
      maxDiscount: 300,
      perUserLimit: 1,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SWEET50" },
    update: {},
    create: {
      code: "SWEET50",
      description: "Flat ₹50 off orders above ₹499",
      type: "FLAT",
      value: 50,
      minOrderValue: 499,
      isActive: true,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
