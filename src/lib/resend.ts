import "server-only";
import { Resend } from "resend";

let cachedClient: Resend | null = null;

/**
 * Lazily constructs the Resend client on first use — same reasoning as
 * getRazorpay(): avoid any module-scope side effect that could run during
 * Next.js's build-time route evaluation before env vars are configured.
 */
export function getResend() {
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}
