/** Converts a raw 10-digit Indian mobile number (or an already-prefixed one) to E.164. */
export function toE164(phone: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, "");
  return digitsOnly.startsWith("+") ? digitsOnly : `+91${digitsOnly}`;
}

/** Strips the +91 country code back off for display in a 10-digit input field. */
export function fromE164(phone: string): string {
  return phone.startsWith("+91") ? phone.slice(3) : phone;
}
