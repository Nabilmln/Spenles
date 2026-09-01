export function toRegisterErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Registration could not be completed. Check your details and try again.";
  }

  const code =
    "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const message =
    "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  switch (code) {
    case "EMAIL_ALREADY_USED":
    case "USER_ALREADY_EXISTS":
      return "This email is already registered. Please sign in.";
    case "INVALID_EMAIL":
      return "Invalid email format.";
    case "PASSWORD_TOO_SHORT":
      return "Password is too short.";
    case "EMAIL_NOT_VERIFIED":
      return "Email is not verified. Check your inbox for the verification link.";
    default:
      break;
  }

  if (code) {
    return `Registration failed (code ${code}). Check your details or try again.`;
  }
  if (message) {
    return `Registration failed: ${message}`;
  }
  return "Registration could not be completed. Check your details and try again.";
}
