import "server-only";

/**
 * MSG91 OTP API (v5) — used instead of Supabase's native phone-auth
 * provider list (Twilio/MessageBird/Vonage/TextLocal only), since MSG91
 * isn't one of them. MSG91 owns OTP generation, storage, and expiry on
 * its side; we only send/verify against it. See lib/auth.ts for how a
 * verified OTP gets bridged into an actual Supabase session.
 */

type Msg91Result = { success: true } | { success: false; error: string };

function digitsWithCountryCode(phone: string): string {
  // MSG91 wants "91XXXXXXXXXX" — country code, no "+".
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12 ? digits : `91${digits.slice(-10)}`;
}

export async function sendMsg91Otp(phone: string): Promise<Msg91Result> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) {
    return { success: false, error: "SMS sign-in isn't set up yet — please try email instead." };
  }

  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId)}&mobile=${digitsWithCountryCode(phone)}&authkey=${encodeURIComponent(authKey)}`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.type !== "success") {
      console.error("MSG91 send OTP failed:", res.status, data);
      return { success: false, error: "Could not send the code. Please try again." };
    }
    return { success: true };
  } catch (error) {
    console.error("MSG91 send OTP threw:", error);
    return { success: false, error: "Could not send the code. Please try again." };
  }
}

export async function verifyMsg91Otp(phone: string, otp: string): Promise<Msg91Result> {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    return { success: false, error: "SMS sign-in isn't set up yet — please try email instead." };
  }

  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(otp)}&mobile=${digitsWithCountryCode(phone)}`,
      { method: "POST", headers: { authkey: authKey } }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.type !== "success") {
      return { success: false, error: "Incorrect or expired code. Please try again." };
    }
    return { success: true };
  } catch (error) {
    console.error("MSG91 verify OTP threw:", error);
    return { success: false, error: "Could not verify the code. Please try again." };
  }
}
