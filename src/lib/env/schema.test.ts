import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./schema";

const validEnv = {
  DATABASE_URL: "postgresql://user:password@example.neon.tech/neondb",
  NEON_AUTH_BASE_URL: "https://auth.example.neon.tech",
  NEON_AUTH_COOKIE_SECRET: "a-secure-cookie-secret-with-32-characters",
};

describe("parseServerEnv", () => {
  it("returns a complete server configuration", () => {
    expect(parseServerEnv(validEnv)).toEqual(validEnv);
  });

  it("reports variable names without exposing values", () => {
    expect(() =>
      parseServerEnv({ ...validEnv, NEON_AUTH_COOKIE_SECRET: "short-secret" }),
    ).toThrow("NEON_AUTH_COOKIE_SECRET");
    expect(() =>
      parseServerEnv({ ...validEnv, NEON_AUTH_COOKIE_SECRET: "short-secret" }),
    ).not.toThrow("short-secret");
  });

  it("rejects a non-PostgreSQL database URL", () => {
    expect(() =>
      parseServerEnv({ ...validEnv, DATABASE_URL: "https://example.com" }),
    ).toThrow("DATABASE_URL");
  });

  it("accepts an omitted scheduler secret and rejects a short configured one", () => {
    expect(parseServerEnv(validEnv).CRON_SECRET).toBeUndefined();
    expect(() =>
      parseServerEnv({ ...validEnv, CRON_SECRET: "short" }),
    ).toThrow("CRON_SECRET");
  });
});
