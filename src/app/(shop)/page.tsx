import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Testimonials } from "@/components/home/testimonials";
import { CtaSection } from "@/components/home/cta-section";
import { getCategories, getFeaturedProducts } from "@/lib/data/storefront";
import { testimonials } from "@/lib/data/catalog";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      {/* The hero is now a sliding banner that includes the WELCOME10/
          festive-gifting offers, so the standalone Promotions section
          (same two offers again) was dropped to avoid repeating them. */}
      <Hero />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <Testimonials testimonials={testimonials} />
      <CtaSection />
    </>
  );
}
