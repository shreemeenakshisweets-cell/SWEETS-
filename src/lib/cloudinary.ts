import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Lazily configures the Cloudinary SDK on first use — mirrors the
 * getRazorpay()/getResend() pattern so a missing env var only breaks the
 * specific upload call that needs it, rather than crashing the build when
 * this module is first evaluated (before real credentials are set).
 */
function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** Uploads an image buffer to Cloudinary and returns its public HTTPS URL. */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string> {
  const client = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
