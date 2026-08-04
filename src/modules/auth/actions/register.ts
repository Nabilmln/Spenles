"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { registerSchema } from "../schemas/register";
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
    return {
      error:
        "Pendaftaran belum berhasil. Periksa data Anda atau gunakan email lain.",
    };
  }

  redirect("/dashboard");
}
