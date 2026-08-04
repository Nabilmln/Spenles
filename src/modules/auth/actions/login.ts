"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { loginSchema } from "../schemas/login";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function loginAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.signIn.email(parsed.data);

  if (error) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  redirect("/dashboard");
}
