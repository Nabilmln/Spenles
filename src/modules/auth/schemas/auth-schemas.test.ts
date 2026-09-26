import { describe, expect, it } from "vitest";
import { forgotPasswordSchema } from "./forgot-password";
import { loginSchema } from "./login";
import { registerSchema } from "./register";
import { resetPasswordSchema } from "./reset-password";

describe("authentication schemas", () => {
  it("accepts valid login input", () => {
    expect(
      loginSchema.safeParse({
        email: "pengguna@example.com",
        password: "rahasia",
      }).success,
    ).toBe(true);
  });

  it("rejects malformed login input", () => {
    expect(loginSchema.safeParse({ email: "bukan-email", password: "" }).success).toBe(false);
  });

  it("accepts matching registration credentials", () => {
    expect(
      registerSchema.safeParse({
        name: "Budi Santoso",
        email: "budi@example.com",
        password: "kata-sandi-kuat",
        passwordConfirmation: "kata-sandi-kuat",
      }).success,
    ).toBe(true);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      name: "Budi Santoso",
      email: "budi@example.com",
      password: "kata-sandi-kuat",
      passwordConfirmation: "berbeda-sekali",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid forgot-password request", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "pengguna@example.com" }).success,
    ).toBe(true);
  });

  it("rejects a malformed forgot-password email", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "bukan-email" }).success,
    ).toBe(false);
  });

  it("accepts matching reset credentials", () => {
    expect(
      resetPasswordSchema.safeParse({
        token: "reset-token",
        password: "kata-sandi-baru",
        passwordConfirmation: "kata-sandi-baru",
      }).success,
    ).toBe(true);
  });

  it("rejects reset input with a mismatched confirmation", () => {
    const result = resetPasswordSchema.safeParse({
      token: "reset-token",
      password: "kata-sandi-baru",
      passwordConfirmation: "beda-lagi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects reset input without a token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "kata-sandi-baru",
      passwordConfirmation: "kata-sandi-baru",
    });
    expect(result.success).toBe(false);
  });
});
