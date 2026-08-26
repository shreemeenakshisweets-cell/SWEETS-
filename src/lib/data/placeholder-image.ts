/**
 * Deterministic branded placeholder imagery for Phase 1 demo content.
 * Swap product/category images for real Cloudinary photography before
 * launch — see README "Replacing placeholder content".
 */
export function placeholderImage(
  label: string,
  { size = 800, bg = "f3e7c3", fg = "4a3b0e" }: { size?: number; bg?: string; fg?: string } = {}
) {
  const text = encodeURIComponent(label);
  // /png suffix forces a raster response — Next's image optimizer refuses to
  // process placehold.co's default image/svg+xml output.
  return `https://placehold.co/${size}x${size}/${bg}/${fg}/png?text=${text}`;
}
