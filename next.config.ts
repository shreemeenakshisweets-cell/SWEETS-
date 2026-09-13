import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
