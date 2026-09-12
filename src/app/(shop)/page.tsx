import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Testimonials } from "@/components/home/testimonials";
import { CtaSection } from "@/components/home/cta-section";
import { getActiveBanners, getCategories, getFeaturedProducts } from "@/lib/data/storefront";
import { testimonials } from "@/lib/data/catalog";

export default async function HomePage() {
  const [categories, featured, banners] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getActiveBanners(),
  ]);

  return (
    <>
      {/* The hero is now an admin-managed sliding banner (see
          /admin/banners) that already covers offers/coupons, so the
          standalone Promotions section (the same two offers again) was
          dropped to avoid repeating them. */}
      <Hero banners={banners} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <Testimonials testimonials={testimonials} />
      <CtaSection />
    </>
  );
}
