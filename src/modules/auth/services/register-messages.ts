export function toRegisterErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Pendaftaran belum berhasil. Periksa data Anda atau coba lagi.";
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
      return "Email sudah terdaftar. Silakan masuk.";
    case "INVALID_EMAIL":
      return "Format email tidak valid.";
    case "PASSWORD_TOO_SHORT":
      return "Kata sandi terlalu pendek.";
    case "EMAIL_NOT_VERIFIED":
      return "Email belum diverifikasi. Periksa kotak masuk Anda untuk tautan verifikasi.";
    default:
      break;
  }

  if (code) {
    return `Pendaftaran gagal (kode ${code}). Periksa data atau coba lagi.`;
  }
  if (message) {
    return `Pendaftaran gagal: ${message}`;
  }
  return "Pendaftaran belum berhasil. Periksa data Anda atau coba lagi.";
}
