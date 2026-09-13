/**
 * Shared brand-colour gradient presets for banners — used by both the
 * admin banner form (as a simple dropdown, no raw hex-picking needed) and
 * the storefront Hero carousel that renders them.
 */
export const BANNER_THEMES = {
  gold: { label: "Gold (brand default)", from: "#3d3108", to: "#8c6d1f" },
  olive: { label: "Deep Olive", from: "#332804", to: "#7a6118" },
  festive: { label: "Festive Red", from: "#6b230f", to: "#b3401f" },
  maroon: { label: "Royal Maroon", from: "#3d0f1f", to: "#7a1f3d" },
} as const;

export type BannerTheme = keyof typeof BANNER_THEMES;

export const BANNER_THEME_KEYS = Object.keys(BANNER_THEMES) as BannerTheme[];

/**
 * Returns an inline style, not a Tailwind class — Tailwind's static
 * scanner can only pick up complete literal class strings in source, and
 * this gradient is built from per-banner data at runtime, so a
 * dynamically-interpolated `bg-[linear-gradient(...)]` class would never
 * get its CSS generated.
 */
export function bannerGradientStyle(theme: string): { backgroundImage: string } {
  const preset = BANNER_THEMES[theme as BannerTheme] ?? BANNER_THEMES.gold;
  return { backgroundImage: `linear-gradient(120deg, ${preset.from} 0%, ${preset.to} 100%)` };
}

/**
 * The 9-point manual crop position, standard CSS object-position keywords —
 * lets an admin choose which part of a "Fill frame" (cover) photo stays
 * visible when it's cropped to fill the banner on any given screen size.
 */
export const BANNER_POSITIONS = {
  "top left": "Top left",
  top: "Top",
  "top right": "Top right",
  left: "Left",
  center: "Center (default)",
  right: "Right",
  "bottom left": "Bottom left",
  bottom: "Bottom",
  "bottom right": "Bottom right",
} as const;

export type BannerPosition = keyof typeof BANNER_POSITIONS;

export const BANNER_POSITION_KEYS = Object.keys(BANNER_POSITIONS) as BannerPosition[];
