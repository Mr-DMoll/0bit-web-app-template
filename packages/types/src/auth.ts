import { z } from "zod";

export const registerSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password:   z.string().min(1, "Password is required"),
});

export const verifyCodeSchema = z.object({
  target: z.string().min(1, "Target is required"),
  code:   z.string().length(6, "Code must be 6 digits").regex(/^\d+$/),
});

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character");

export type RegisterInput   = z.infer<typeof registerSchema>;
export type LoginInput      = z.infer<typeof loginSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;