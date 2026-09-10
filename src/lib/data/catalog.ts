import type { Promotion, Testimonial } from "@/types/catalog";
import { placeholderImage } from "@/lib/data/placeholder-image";

// Real product/category catalog comes from the database via
// src/lib/data/storefront.ts (admin-managed — see /admin/products and
// /admin/categories). Testimonials and promotions below have no admin UI
// yet, so they stay as static marketing content for now.

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Priya Raghavan",
    location: "Vijayawada",
    rating: 5,
    quote:
      "The Kaju Katli tastes exactly like my grandmother's recipe — and it arrived perfectly packed within a day. This is our go-to for every festival now.",
    avatarUrl: placeholderImage("PR", { size: 128 }),
  },
  {
    id: "t2",
    name: "Arjun Mehta",
    location: "Hyderabad",
    rating: 5,
    quote:
      "Ordered the Diwali hamper for my whole office. Beautifully packaged and every single sweet was fresh. Will absolutely order again.",
    avatarUrl: placeholderImage("AM", { size: 128 }),
  },
  {
    id: "t3",
    name: "Lakshmi Narayanan",
    location: "Chennai",
    rating: 4,
    quote:
      "Andhra Mixture is dangerously addictive. Delivery tracking kept me updated the whole way — really smooth experience.",
    avatarUrl: placeholderImage("LN", { size: 128 }),
  },
];

export const promotions: Promotion[] = [
  {
    id: "promo-welcome",
    title: "Flat 10% off your first order",
    description: "New here? Use code WELCOME10 at checkout.",
    code: "WELCOME10",
    imageUrl: placeholderImage("Flat 10% Off", { bg: "b3401f", fg: "fff7ee" }),
    ctaHref: "/menu",
  },
  {
    id: "promo-festive",
    title: "Festive gifting starts here",
    description: "Free delivery on all Gift Box orders above ₹999.",
    code: "FESTIVEFREE",
    imageUrl: placeholderImage("Festive Gifting", { bg: "7a6118", fg: "fffbef" }),
    ctaHref: "/menu?category=gift-boxes",
  },
];
