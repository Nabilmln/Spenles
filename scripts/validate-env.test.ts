import { describe, expect, it } from "vitest";
import { validateReleaseEnvironment } from "./validate-env.mjs";

const valid = {
  DATABASE_URL: "postgresql://user:secret@dev-db.example.net/spenles",
  NEON_AUTH_BASE_URL: "https://auth-dev.example.net",
  NEON_AUTH_COOKIE_SECRET: "a".repeat(40),
  CRON_SECRET: "b".repeat(40),
  NEXT_PUBLIC_APP_NAME: "Spenles",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  TEST_DATABASE_URL: "postgresql://user:secret@test-db.example.net/spenles_test",
};

describe("release environment validation", () => {
  it("accepts a complete local configuration without exposing values", () => {
    expect(validateReleaseEnvironment(valid)).toEqual({
      success: true,
      issues: [],
      production: false,
    });
  });

  it("requires HTTPS and non-placeholder values in production", () => {
    const result = validateReleaseEnvironment({
      ...valid,
      NODE_ENV: "production",
      NEON_AUTH_BASE_URL: "http://localhost:4000",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      CRON_SECRET: "replace-with-a-strong-random-scheduler-secret",
    });
    expect(result.success).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        "CRON_SECRET masih placeholder",
        "NEON_AUTH_BASE_URL production wajib HTTPS",
        "NEXT_PUBLIC_APP_URL production wajib HTTPS",
      ]),
    );
  });

  it("rejects a test database equal to the application database", () => {
    const result = validateReleaseEnvironment({
      ...valid,
      TEST_DATABASE_URL: valid.DATABASE_URL,
    });
    expect(result.issues).toContain(
      "TEST_DATABASE_URL tidak boleh sama dengan DATABASE_URL",
    );
  });
});
