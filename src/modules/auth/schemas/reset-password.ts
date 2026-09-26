import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "The reset link is incomplete."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),
    passwordConfirmation: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Password confirmation does not match.",
  });