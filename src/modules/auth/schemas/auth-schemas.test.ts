import { describe, expect, it } from "vitest";
import { loginSchema } from "./login";
import { registerSchema } from "./register";

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
});
