import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Promotions } from "@/components/home/promotions";
import { Testimonials } from "@/components/home/testimonials";
import { CtaSection } from "@/components/home/cta-section";
import { getCategories, getFeaturedProducts } from "@/lib/data/storefront";
import { promotions, testimonials } from "@/lib/data/catalog";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <Promotions promotions={promotions} />
      <Testimonials testimonials={testimonials} />
      <CtaSection />
    </>
  );
}
