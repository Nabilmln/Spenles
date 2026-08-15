import { describe, expect, it } from "vitest";
import { toRegisterErrorMessage } from "./register-messages";

describe("toRegisterErrorMessage", () => {
  it("maps known better-auth error codes to friendly messages", () => {
    expect(toRegisterErrorMessage({ code: "EMAIL_ALREADY_USED" })).toBe(
      "Email sudah terdaftar. Silakan masuk.",
    );
    expect(toRegisterErrorMessage({ code: "INVALID_EMAIL" })).toBe(
      "Format email tidak valid.",
    );
    expect(toRegisterErrorMessage({ code: "PASSWORD_TOO_SHORT" })).toBe(
      "Kata sandi terlalu pendek.",
    );
    expect(toRegisterErrorMessage({ code: "EMAIL_NOT_VERIFIED" })).toBe(
      "Email belum diverifikasi. Periksa kotak masuk Anda untuk tautan verifikasi.",
    );
  });

  it("falls back to the code or message for unknown errors", () => {
    expect(toRegisterErrorMessage({ code: "SOME_CODE" })).toBe(
      "Pendaftaran gagal (kode SOME_CODE). Periksa data atau coba lagi.",
    );
    expect(toRegisterErrorMessage({ message: "Boom" })).toBe(
      "Pendaftaran gagal: Boom",
    );
  });

  it("returns a generic message for empty or non-object errors", () => {
    expect(toRegisterErrorMessage(undefined)).toBe(
      "Pendaftaran belum berhasil. Periksa data Anda atau coba lagi.",
    );
    expect(toRegisterErrorMessage(null)).toBe(
      "Pendaftaran belum berhasil. Periksa data Anda atau coba lagi.",
    );
    expect(toRegisterErrorMessage("oops")).toBe(
      "Pendaftaran belum berhasil. Periksa data Anda atau coba lagi.",
    );
    expect(toRegisterErrorMessage({})).toBe(
      "Pendaftaran belum berhasil. Periksa data Anda atau coba lagi.",
    );
  });
});
