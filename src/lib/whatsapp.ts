import "server-only";

/**
 * Sends a WhatsApp message via Twilio's REST API. Plain fetch rather than
 * the `twilio` SDK — one endpoint, not worth the extra dependency.
 *
 * `to` accepts either a bare 10-digit Indian mobile number (assumed +91) or
 * an already-prefixed E.164 number (e.g. "+918008089975").
 *
 * Best-effort: never throws. WhatsApp delivery is a nice-to-have alongside
 * email, not something that should ever be able to break checkout or an
 * admin status update.
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) return;

  const digitsOnly = to.replace(/[^\d+]/g, "");
  const e164 = digitsOnly.startsWith("+") ? digitsOnly : `+91${digitsOnly}`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
          To: `whatsapp:${e164}`,
          Body: body,
        }),
      }
    );
    if (!res.ok) {
      console.error("Twilio WhatsApp send failed:", res.status, await res.text());
    }
  } catch (error) {
    console.error("Twilio WhatsApp send threw:", error);
  }
}
