"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { registerSchema } from "../schemas/register";
import { toRegisterErrorMessage } from "../services/register-messages";
import type { AuthActionState } from "./login";

export async function registerAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.signUp.email({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("[register] signUp.email failed:", error);
    return { error: toRegisterErrorMessage(error) };
  }

  redirect("/dashboard");
}
