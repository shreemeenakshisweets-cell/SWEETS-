/**
 * Accounts created by phone-number login have no real email address. Supabase's
 * Phone provider is deliberately left off (enabling it exposes public phone
 * sign-up, which lets anyone pre-register someone else's number), so these
 * accounts sign in through the email path with a placeholder address on a
 * domain we never send mail to. It must never be shown to people or emailed —
 * use these helpers wherever an account's email is displayed or used.
 */
const PLACEHOLDER_DOMAIN = "phone-login.mysweets.in";

export function phoneLoginEmail(phone: string): string {
  return `${phone.replace(/\D/g, "")}@${PLACEHOLDER_DOMAIN}`;
}

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`);
}

/** The email if it's a real one, otherwise null — for anything that sends mail or pre-fills a form. */
export function realEmail(email: string | null | undefined): string | null {
  return email && !isPlaceholderEmail(email) ? email : null;
}

/** What to show in the UI in place of an email: the address, or the phone for phone-login accounts. */
export function contactLabel(user: { email: string; phone?: string | null }): string {
  return isPlaceholderEmail(user.email) ? (user.phone ?? "Phone account") : user.email;
}
