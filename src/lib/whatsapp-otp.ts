import "server-only";

/**
 * One-time codes delivered over WhatsApp (never SMS) via Twilio Verify's
 * WhatsApp channel. Twilio generates, stores and expires the code and enforces
 * send/attempt limits, so unlike a hand-rolled OTP there's nothing for us to
 * persist. Reuses the same Twilio account already used for order notifications
 * (lib/whatsapp.ts); needs a Verify Service with a WhatsApp sender attached.
 * See verifyPhoneOtpAction in app/(auth)/actions.ts for how a verified number
 * becomes a Supabase session.
 */

type OtpResult = { success: true } | { success: false; error: string };

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `+91${digits.slice(-10)}`;
}

function config() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) return null;
  return {
    base: `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}`,
    authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
  };
}

async function post(path: string, body: Record<string, string>) {
  const cfg = config()!;
  const res = await fetch(`${cfg.base}/${path}`, {
    method: "POST",
    headers: {
      Authorization: cfg.authorization,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

const NOT_CONFIGURED: OtpResult = {
  success: false,
  error: "WhatsApp sign-in isn't set up yet — please use email instead.",
};

export async function sendWhatsAppOtp(phone: string): Promise<OtpResult> {
  if (!config()) return NOT_CONFIGURED;

  try {
    const { res, data } = await post("Verifications", {
      To: toE164(phone),
      Channel: "whatsapp",
    });
    if (res.ok && data?.status === "pending") return { success: true };

    console.error("Twilio Verify send failed:", res.status, data);
    if (res.status === 429 || data?.code === 60203) {
      return { success: false, error: "Too many codes requested. Please wait a few minutes and try again." };
    }
    if (data?.code === 60200 || data?.code === 60205) {
      return { success: false, error: "That number can't receive WhatsApp messages. Please check it and try again." };
    }
    return { success: false, error: "Could not send the code on WhatsApp. Please try again." };
  } catch (error) {
    console.error("Twilio Verify send threw:", error);
    return { success: false, error: "Could not send the code on WhatsApp. Please try again." };
  }
}

export async function verifyWhatsAppOtp(phone: string, otp: string): Promise<OtpResult> {
  if (!config()) return NOT_CONFIGURED;

  try {
    const { res, data } = await post("VerificationCheck", { To: toE164(phone), Code: otp });
    if (res.ok && data?.status === "approved") return { success: true };

    // 404: no pending code for this number (expired, already used, or never sent).
    if (res.status === 404) {
      return { success: false, error: "That code has expired. Please request a new one." };
    }
    if (res.status === 429) {
      return { success: false, error: "Too many attempts. Please request a new code." };
    }
    return { success: false, error: "Incorrect code. Please try again." };
  } catch (error) {
    console.error("Twilio Verify check threw:", error);
    return { success: false, error: "Could not verify the code. Please try again." };
  }
}
