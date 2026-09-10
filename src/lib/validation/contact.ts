import { z } from "zod";
import { emailSchema } from "@/lib/validation/auth";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: emailSchema,
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
