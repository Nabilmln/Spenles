import { describe, expect, it } from "vitest";
import { toRegisterErrorMessage } from "./register-messages";

describe("toRegisterErrorMessage", () => {
  it("maps known better-auth error codes to friendly messages", () => {
    expect(toRegisterErrorMessage({ code: "EMAIL_ALREADY_USED" })).toBe(
      "This email is already registered. Please sign in.",
    );
    expect(toRegisterErrorMessage({ code: "INVALID_EMAIL" })).toBe(
      "Invalid email format.",
    );
    expect(toRegisterErrorMessage({ code: "PASSWORD_TOO_SHORT" })).toBe(
      "Password is too short.",
    );
    expect(toRegisterErrorMessage({ code: "EMAIL_NOT_VERIFIED" })).toBe(
      "Email is not verified. Check your inbox for the verification link.",
    );
  });

  it("falls back to the code or message for unknown errors", () => {
    expect(toRegisterErrorMessage({ code: "SOME_CODE" })).toBe(
      "Registration failed (code SOME_CODE). Check your details or try again.",
    );
    expect(toRegisterErrorMessage({ message: "Boom" })).toBe(
      "Registration failed: Boom",
    );
  });

  it("returns a generic message for empty or non-object errors", () => {
    expect(toRegisterErrorMessage(undefined)).toBe(
      "Registration could not be completed. Check your details and try again.",
    );
    expect(toRegisterErrorMessage(null)).toBe(
      "Registration could not be completed. Check your details and try again.",
    );
    expect(toRegisterErrorMessage("oops")).toBe(
      "Registration could not be completed. Check your details and try again.",
    );
    expect(toRegisterErrorMessage({})).toBe(
      "Registration could not be completed. Check your details and try again.",
    );
  });
});
