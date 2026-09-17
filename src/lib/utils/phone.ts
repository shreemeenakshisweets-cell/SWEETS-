/** Converts a raw 10-digit Indian mobile number (or an already-prefixed one) to E.164. */
export function toE164(phone: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, "");
  return digitsOnly.startsWith("+") ? digitsOnly : `+91${digitsOnly}`;
}

/** Strips the +91 country code back off for display in a 10-digit input field. */
export function fromE164(phone: string): string {
  return phone.startsWith("+91") ? phone.slice(3) : phone;
}

/**
 * Normalizes any of "9876543210", "919876543210", or "+919876543210" to
 * "+919876543210" — needed because Supabase and MSG91 don't necessarily
 * echo phone numbers back in the same shape we sent them in, so anywhere
 * we compare "is this the same phone" has to go through this first rather
 * than a raw string match.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}
