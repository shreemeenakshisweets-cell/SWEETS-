import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Promotions } from "@/components/home/promotions";
import { Testimonials } from "@/components/home/testimonials";
import { CtaSection } from "@/components/home/cta-section";
import { categories, getFeaturedProducts, promotions, testimonials } from "@/lib/data/catalog";

export default function HomePage() {
  const featured = getFeaturedProducts();

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
