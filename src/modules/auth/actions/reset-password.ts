"use server";

import { auth } from "@/lib/auth/server";
import { resetPasswordSchema } from "../schemas/reset-password";

export type ResetPasswordActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

export async function resetPasswordAction(
  _state: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.resetPassword({
    newPassword: parsed.data.password,
    token: parsed.data.token,
  });

  if (error) {
    console.error("[reset-password] resetPassword failed:", error);
    return {
      error:
        "The reset link is invalid or has expired. Request a new link and try again.",
    };
  }

  return { success: "Password updated." };
}