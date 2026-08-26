import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review items in your cart before checkout.",
};

export default function CartPage() {
  return <CartView />;
}
