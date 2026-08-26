import crypto from "node:crypto";

/** e.g. SM-20260823-9F3C2A1B — date-prefixed with a random suffix, unique in practice. */
export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SM-${date}-${suffix}`;
}
