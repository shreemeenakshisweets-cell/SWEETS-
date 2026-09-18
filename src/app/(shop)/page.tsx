import { Hero } from "@/components/home/hero";
import { LegacyBanner } from "@/components/home/legacy-banner";
import { TrustBadges } from "@/components/home/trust-badges";
import { BrandStory } from "@/components/home/brand-story";
import { OffersStrip } from "@/components/shared/offers-strip";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Testimonials } from "@/components/home/testimonials";
import { CtaSection } from "@/components/home/cta-section";
import {
  getActiveBanners,
  getCategories,
  getFeaturedProducts,
  getFeaturedTestimonials,
  getHomepageContent,
} from "@/lib/data/storefront";

// Below this many real reviews, the section reads as sparse rather than
// trustworthy — hide it entirely instead of padding with fabricated quotes.
const MIN_TESTIMONIALS_TO_SHOW = 3;

export default async function HomePage() {
  const [categories, featured, banners, testimonials, homepageContent] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getActiveBanners(),
    getFeaturedTestimonials(),
    getHomepageContent(),
  ]);

  return (
    <>
      {/* The hero is now an admin-managed sliding banner (see
          /admin/banners) that already covers offers/coupons, so the
          standalone Promotions section (the same two offers again) was
          dropped to avoid repeating them. */}
      <Hero banners={banners} />
      <LegacyBanner />
      <TrustBadges />
      <OffersStrip className="rounded-none border-x-0 border-t-0" />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
      <BrandStory
        imageUrl={homepageContent?.brandStoryImageUrl ?? undefined}
        imageEnabled={homepageContent?.brandStoryImageEnabled ?? true}
      />
      {testimonials.length >= MIN_TESTIMONIALS_TO_SHOW && (
        <Testimonials testimonials={testimonials} />
      )}
      <CtaSection />
    </>
  );
}
