"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { forgotPasswordSchema } from "../schemas/forgot-password";

export type ForgotPasswordActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: string;
};

async function buildResetRedirectUrl() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/reset-password`;
}

export async function requestPasswordResetAction(
  _state: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await auth.requestPasswordReset({
    email: parsed.data.email,
    redirectTo: await buildResetRedirectUrl(),
  });

  if (error) {
    // Never reveal whether the email is registered; the user receives a
    // neutral success state either way. Log only the infra error for
    // diagnosis (no personal data is printed).
    console.error("[forgot-password] requestPasswordReset failed:", error);
  }

  return { success: "Reset link sent." };
}