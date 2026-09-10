import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Uploads an image buffer to the "product-images" Supabase Storage bucket
 * (public, created via migration) and returns its public HTTPS URL. Uses
 * the service-role client since admin-only callers already gate access via
 * requireAdmin() — mirrors how the rest of the admin panel bypasses RLS
 * through Prisma's direct Postgres connection.
 */
export async function uploadProductImage(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
