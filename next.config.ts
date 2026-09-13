import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js (and Vercel's production image optimizer specifically) only
    // serves quality values listed here — the Hero banner's `quality={90}`
    // (see src/components/home/hero.tsx) was being rejected outright with
    // "INVALID_IMAGE_OPTIMIZE_REQUEST" in production because 90 wasn't
    // whitelisted. 75 is next/image's own default, kept for every other
    // image on the site that doesn't pass an explicit `quality`.
    qualities: [75, 90],
    remotePatterns: [
      // Phase 1 placeholder catalog imagery.
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage (product photos, banner photos — uploaded via the
      // admin panel). Hardcoded rather than derived from
      // NEXT_PUBLIC_SUPABASE_URL at config-eval time: that env var isn't
      // reliably populated yet when Turbopack loads next.config.ts, which
      // silently produced an empty remotePatterns entry and made every
      // Supabase-hosted image 400 ("url parameter is not allowed") the
      // moment the image-optimizer cache was cold.
      { protocol: "https", hostname: "mhyeittyesfrzgdixtit.supabase.co" },
    ],
  },
};

export default nextConfig;
