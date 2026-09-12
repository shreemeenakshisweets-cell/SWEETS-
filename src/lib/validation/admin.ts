import { z } from "zod";
import { BANNER_THEME_KEYS } from "@/lib/data/banner-themes";

export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter a category name"),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().trim().min(1, "Enter a short description"),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int(),
});
// z.input (not z.infer/z.output) — react-hook-form needs the pre-coercion
// shape since <input type="number"> etc. hand it raw strings; z.coerce
// converts them to numbers at parse time inside the server action.
export type CategoryInput = z.input<typeof categoryInputSchema>;

export const variantInputSchema = z.object({
  id: z.string().uuid().optional(), // present when editing an existing variant
  label: z.string().trim().min(1, "Enter a label, e.g. 250 g"),
  weightGrams: z.coerce.number().int().positive().optional().nullable(),
  price: z.coerce.number().positive("Enter a price"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().trim().min(3, "Enter a SKU"),
  stock: z.coerce.number().int().min(0),
  isDefault: z.boolean(),
});
export type VariantInput = z.input<typeof variantInputSchema>;

export const productInputSchema = z.object({
  id: z.string().uuid().optional(), // present when editing
  categoryId: z.string().uuid("Select a category"),
  name: z.string().trim().min(2, "Enter a product name"),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().trim().min(10, "Enter a description"),
  images: z.array(z.string().trim().url()).min(1, "Add at least one image URL"),
  isVeg: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  tags: z.array(z.enum(["bestseller", "new", "spicy", "sugar-free", "festive", "limited"])),
  variants: z.array(variantInputSchema).min(1, "Add at least one variant"),
});
export type ProductInput = z.input<typeof productInputSchema>;

export const couponInputSchema = z.object({
  id: z.string().uuid().optional(),
  code: z
    .string()
    .trim()
    .min(3, "Enter a coupon code")
    .transform((v) => v.toUpperCase()),
  description: z.string().trim().optional().or(z.literal("")),
  type: z.enum(["PERCENTAGE", "FLAT"]),
  value: z.coerce.number().positive("Enter a value"),
  minOrderValue: z.coerce.number().nonnegative().optional().nullable(),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});
export type CouponInput = z.input<typeof couponInputSchema>;

export const bannerInputSchema = z.object({
  id: z.string().uuid().optional(),
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  heading: z.string().trim().min(2, "Enter a heading"),
  body: z.string().trim().min(10, "Enter body text"),
  ctaLabel: z.string().trim().min(2, "Enter a button label"),
  ctaHref: z.string().trim().min(1, "Enter a link, e.g. /menu"),
  theme: z.enum(BANNER_THEME_KEYS as [string, ...string[]]),
  sortOrder: z.coerce.number().int(),
  isActive: z.boolean(),
});
export type BannerInput = z.input<typeof bannerInputSchema>;

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "PACKED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
