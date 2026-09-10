"use server";

import { getResend } from "@/lib/resend";
import { BUSINESS } from "@/lib/business";
import { contactMessageSchema } from "@/lib/validation/contact";

type ActionResult = { error?: string; success?: true };

export async function sendContactMessageAction(input: unknown): Promise<ActionResult> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message" };
  }
  const { name, email, phone, message } = parsed.data;

  if (!process.env.RESEND_API_KEY) {
    console.error("Contact form submitted but RESEND_API_KEY is not configured:", {
      name,
      email,
      phone,
      message,
    });
    return { error: "Messaging isn't set up yet — please call or email us directly." };
  }

  try {
    await getResend().emails.send({
      from: `${BUSINESS.tradeName} website <${process.env.RESEND_FROM_EMAIL || "orders@resend.dev"}>`,
      to: BUSINESS.email,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send contact form message:", error);
    return { error: "Couldn't send your message right now — please try again or email us directly." };
  }
}
