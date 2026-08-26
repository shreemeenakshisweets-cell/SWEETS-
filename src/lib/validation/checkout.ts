import { z } from "zod";

export const addressInputSchema = z.object({
  // No .default() here — react-hook-form's zodResolver needs the input and
  // output types to match, so defaults are supplied via useForm's
  // defaultValues instead.
  type: z.enum(["HOME", "WORK", "OTHER"]),
  fullName: z.string().trim().min(2, "Enter the recipient's full name"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().trim().min(3, "Enter the address"),
  line2: z.string().trim().optional().or(z.literal("")),
  landmark: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter the city"),
  state: z.string().trim().min(2, "Enter the state"),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export const checkoutItemSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
  addressId: z.string().uuid("Select a delivery address"),
  deliveryInstructions: z.string().trim().max(500).optional().or(z.literal("")),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
