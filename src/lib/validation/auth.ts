import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: emailSchema,
  password: passwordSchema,
});

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  token: z.string().trim().length(6, "Enter the 6-digit code"),
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
