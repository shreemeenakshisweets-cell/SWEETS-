import type { Testimonial } from "@/types/catalog";
import { placeholderImage } from "@/lib/data/placeholder-image";

// Real product/category catalog comes from the database via
// src/lib/data/storefront.ts (admin-managed — see /admin/products and
// /admin/categories). Testimonials below have no admin UI yet, so they
// stay as static marketing content for now.

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
