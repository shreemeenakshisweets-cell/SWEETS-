/**
 * Friendly fallback message for when a form submission throws instead of
 * returning a normal `{ error }` result — e.g. a browser extension (ad
 * blockers, antivirus "safe browsing" tools like McAfee WebAdvisor/Norton)
 * intercepting or breaking the request before it reaches our server. Never
 * surface the raw exception (e.g. "Cannot convert argument to a ByteString...")
 * to the customer — it's meaningless to them and looks broken/unsafe.
 */
export function getActionErrorMessage(error: unknown): string {
  console.error("Unexpected error submitting form:", error);
  return "Something went wrong sending this. If you have a browser extension like an ad blocker or antivirus web protection (e.g. McAfee, Norton), try disabling it for this site or use a different browser, then try again.";
}
