export interface ProductVariant {
  id: string;
  label: string;
  weightGrams?: number;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  isDefault?: boolean;
}

export type ProductTag =
  | "bestseller"
  | "new"
  | "spicy"
  | "sugar-free"
  | "festive"
  | "limited";

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  images: string[];
  isVeg: boolean;
  isFeatured?: boolean;
  tags: ProductTag[];
  ratingAverage: number;
  ratingCount: number;
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  avatarUrl: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  imageUrl: string;
  ctaHref: string;
}
