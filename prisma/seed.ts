/**
 * Seeds the database with a demo catalog, for spinning up a fresh dev/
 * staging database. The live app reads products from the database itself
 * (src/lib/data/storefront.ts, admin-managed via /admin/products) — this
 * demo data is self-contained here rather than shared with the app, so
 * re-running this script never touches real, admin-added catalog data.
 * Run with `npx prisma db seed` (or automatically after `prisma migrate dev`).
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { placeholderImage } from "../src/lib/data/placeholder-image";
import type { Category, Product } from "../src/types/catalog";

const categories: Category[] = [
  {
    id: "cat-sweets",
    slug: "sweets",
    name: "Traditional Sweets",
    description: "Time-honoured mithai made fresh in small batches, every day.",
    imageUrl: placeholderImage("Traditional Sweets", { bg: "f3e7c3", fg: "4a3b0e" }),
  },
  {
    id: "cat-dry-fruit",
    slug: "dry-fruit-sweets",
    name: "Dry Fruit Specials",
    description: "Premium cashew, almond and pistachio sweets for gifting or indulging.",
    imageUrl: placeholderImage("Dry Fruit Specials", { bg: "e7dec8", fg: "4a3b0e" }),
  },
  {
    id: "cat-savouries",
    slug: "savouries",
    name: "Savouries & Namkeen",
    description: "Crunchy, spiced snacks — the perfect companion to evening chai.",
    imageUrl: placeholderImage("Savouries & Namkeen", { bg: "f5e6af", fg: "4a3b0e" }),
  },
  {
    id: "cat-gift-boxes",
    slug: "gift-boxes",
    name: "Festive Gift Boxes",
    description: "Curated assortments boxed for festivals, weddings and celebrations.",
    imageUrl: placeholderImage("Festive Gift Boxes", { bg: "b3401f", fg: "fff7ee" }),
  },
  {
    id: "cat-beverages",
    slug: "beverages",
    name: "Beverages",
    description: "Filter coffee, masala chai and traditional drink mixes.",
    imageUrl: placeholderImage("Beverages", { bg: "6b5b2a", fg: "f8edb7" }),
  },
  {
    id: "cat-bakery",
    slug: "bakery",
    name: "Bakery & Prepared Foods",
    description: "Fresh-batch kesari, laddus and other prepared favourites.",
    imageUrl: placeholderImage("Bakery & Prepared Foods", { bg: "f3e7c3", fg: "4a3b0e" }),
  },
];

function variant(
  label: string,
  price: number,
  sku: string,
  opts: Partial<Product["variants"][number]> = {}
) {
  return {
    id: sku,
    label,
    price,
    sku,
    stock: 40,
    ...opts,
  };
}

const products: Product[] = [
  {
    id: "p-mysore-pak",
    slug: "mysore-pak",
    name: "Mysore Pak",
    categorySlug: "sweets",
    shortDescription: "Melt-in-the-mouth gram flour and ghee classic.",
    description:
      "Our signature Mysore Pak is made the traditional way — pure ghee, roasted gram flour and sugar syrup, hand-poured and cut while still warm for that iconic porous, melt-in-the-mouth texture.",
    images: [placeholderImage("Mysore Pak")],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller"],
    ratingAverage: 4.8,
    ratingCount: 214,
    variants: [
      variant("250 g", 320, "SM-MYSP-250", { compareAtPrice: 360, isDefault: true }),
      variant("500 g", 610, "SM-MYSP-500", { compareAtPrice: 690 }),
    ],
  },
  {
    id: "p-kaju-katli",
    slug: "kaju-katli",
    name: "Kaju Katli",
    categorySlug: "dry-fruit-sweets",
    shortDescription: "Silver-leaf topped cashew diamonds.",
    description:
      "Premium whole cashews ground into a smooth dough with sugar and ghee, rolled thin and topped with edible silver leaf.",
    images: [placeholderImage("Kaju Katli")],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller"],
    ratingAverage: 4.9,
    ratingCount: 342,
    variants: [
      variant("250 g", 460, "SM-KAJK-250", { compareAtPrice: 520, isDefault: true }),
      variant("500 g", 890, "SM-KAJK-500", { compareAtPrice: 1000 }),
    ],
  },
  {
    id: "p-andhra-mixture",
    slug: "andhra-mixture",
    name: "Andhra Mixture",
    categorySlug: "savouries",
    shortDescription: "Spiced sev, peanut and lentil mix.",
    description:
      "A fiery, crunchy blend of sev, fried lentils, peanuts and curry leaves — our most-loved evening snack.",
    images: [placeholderImage("Andhra Mixture", { bg: "f5e6af" })],
    isVeg: true,
    isFeatured: true,
    tags: ["bestseller", "spicy"],
    ratingAverage: 4.7,
    ratingCount: 268,
    variants: [
      variant("200 g", 160, "SM-ANDM-200", { isDefault: true }),
      variant("400 g", 300, "SM-ANDM-400"),
    ],
  },
  {
    id: "p-festive-assorted-box",
    slug: "festive-assorted-sweets-box",
    name: "Festive Assorted Sweets Box",
    categorySlug: "gift-boxes",
    shortDescription: "A curated box of six signature sweets.",
    description:
      "Our most popular gifting box — six signature sweets including Kaju Katli, Mysore Pak and Motichoor Laddu, beautifully packaged.",
    images: [placeholderImage("Festive Assorted Box", { bg: "b3401f", fg: "fff7ee" })],
    isVeg: true,
    isFeatured: true,
    tags: ["festive", "bestseller"],
    ratingAverage: 4.9,
    ratingCount: 156,
    variants: [
      variant("1 kg Box", 1450, "SM-GIFT-ASST-1KG", { compareAtPrice: 1650, isDefault: true }),
    ],
  },
  {
    id: "p-filter-coffee-powder",
    slug: "filter-coffee-powder",
    name: "Filter Coffee Powder",
    categorySlug: "beverages",
    shortDescription: "Traditional South Indian coffee-chicory blend.",
    description:
      "A classic 80:20 coffee-chicory blend, roasted and ground fresh for authentic South Indian filter coffee.",
    images: [placeholderImage("Filter Coffee Powder", { bg: "6b5b2a", fg: "f8edb7" })],
    isVeg: true,
    tags: ["bestseller"],
    ratingAverage: 4.7,
    ratingCount: 143,
    variants: [
      variant("200 g", 220, "SM-COFF-200", { isDefault: true }),
      variant("500 g", 510, "SM-COFF-500"),
    ],
  },
  {
    id: "p-rava-kesari",
    slug: "rava-kesari",
    name: "Rava Kesari",
    categorySlug: "bakery",
    shortDescription: "Saffron semolina pudding, fresh-batch made.",
    description:
      "Semolina cooked in ghee with saffron, sugar and cashews — a warm, comforting South Indian classic, made fresh daily.",
    images: [placeholderImage("Rava Kesari")],
    isVeg: true,
    tags: ["new"],
    ratingAverage: 4.6,
    ratingCount: 47,
    variants: [
      variant("250 g", 180, "SM-KESA-250", { isDefault: true }),
      variant("500 g", 340, "SM-KESA-500"),
    ],
  },
];

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
