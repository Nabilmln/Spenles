import { describe, expect, it } from "vitest";
import { parseE2eEnvironment } from "./environment";

const valid = {
  E2E_BASE_URL: "http://127.0.0.1:3100",
  E2E_TEST_TARGET_ID: "branch-test-01",
  E2E_AUTH_TEST_TARGET_ID: "branch-test-01",
  E2E_NEON_AUTH_BASE_URL: "https://auth-test.example.net",
  E2E_USER_A_EMAIL: "a@example.net",
  E2E_USER_A_PASSWORD: "password-a",
  E2E_USER_B_EMAIL: "b@example.net",
  E2E_USER_B_PASSWORD: "password-b",
  DATABASE_URL: "postgresql://user:pass@dev-db.example.net/spenles",
  TEST_DATABASE_URL: "postgresql://user:pass@test-db.example.net/spenles",
  NEON_AUTH_BASE_URL: "https://auth-dev.example.net",
};

describe("E2E environment safety", () => {
  it("accepts distinct matching non-production targets", () => {
    expect(parseE2eEnvironment(valid)).toMatchObject({
      baseUrl: "http://127.0.0.1:3100",
      targetId: "branch-test-01",
    });
  });

  it("rejects database/Auth branch identity mismatch", () => {
    expect(() =>
      parseE2eEnvironment({
        ...valid,
        E2E_AUTH_TEST_TARGET_ID: "other-branch",
      }),
    ).toThrow(/identitas branch/iu);
  });

  it("rejects production and ordinary application targets", () => {
    expect(() =>
      parseE2eEnvironment({ ...valid, VERCEL_ENV: "production" }),
    ).toThrow(/production/iu);
    expect(() =>
      parseE2eEnvironment({
        ...valid,
        TEST_DATABASE_URL: valid.DATABASE_URL,
      }),
    ).toThrow(/TEST_DATABASE_URL sama/iu);
  });
});
