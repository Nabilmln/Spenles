import { z } from "zod";

const e2eSchema = z.object({
  E2E_BASE_URL: z.url(),
  E2E_TEST_TARGET_ID: z.string().min(6),
  E2E_AUTH_TEST_TARGET_ID: z.string().min(6),
  E2E_NEON_AUTH_BASE_URL: z.url(),
  E2E_USER_A_EMAIL: z.email(),
  E2E_USER_A_PASSWORD: z.string().min(8),
  E2E_USER_B_EMAIL: z.email(),
  E2E_USER_B_PASSWORD: z.string().min(8),
  DATABASE_URL: z.url(),
  TEST_DATABASE_URL: z.url(),
  NEON_AUTH_BASE_URL: z.url().optional(),
  NODE_ENV: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
});

export function parseE2eEnvironment(
  source: Record<string, string | undefined>,
) {
  const parsed = e2eSchema.safeParse(source);
  if (!parsed.success) {
    const names = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `E2E dibatalkan: environment terisolasi tidak lengkap (${names}).`,
    );
  }
  const value = parsed.data;
  const baseUrl = new URL(value.E2E_BASE_URL);
  const databaseUrl = new URL(value.DATABASE_URL);
  const testDatabaseUrl = new URL(value.TEST_DATABASE_URL);
  const authUrl = new URL(value.E2E_NEON_AUTH_BASE_URL);
  const productionText = [
    value.NODE_ENV,
    value.VERCEL_ENV,
    baseUrl.hostname,
    testDatabaseUrl.hostname,
    testDatabaseUrl.pathname,
    authUrl.hostname,
  ].join(" ");
  if (
    value.NODE_ENV === "production" ||
    value.VERCEL_ENV === "production" ||
    /(^|[._/-])prod(uction)?([._/-]|$)/iu.test(productionText)
  ) {
    throw new Error("E2E dibatalkan: target teridentifikasi sebagai production.");
  }
  if (databaseUrl.href === testDatabaseUrl.href) {
    throw new Error(
      "E2E dibatalkan: TEST_DATABASE_URL sama dengan DATABASE_URL.",
    );
  }
  if (value.NEON_AUTH_BASE_URL === value.E2E_NEON_AUTH_BASE_URL) {
    throw new Error(
      "E2E dibatalkan: endpoint Auth uji sama dengan endpoint aplikasi biasa.",
    );
  }
  if (value.E2E_TEST_TARGET_ID !== value.E2E_AUTH_TEST_TARGET_ID) {
    throw new Error(
      "E2E dibatalkan: identitas branch database dan Auth tidak cocok.",
    );
  }
  const baseAllowed =
    ["localhost", "127.0.0.1"].includes(baseUrl.hostname) ||
    /(?:^|[.-])(preview|test|dev)(?:[.-]|$)/iu.test(baseUrl.hostname);
  if (!baseAllowed) {
    throw new Error(
      "E2E dibatalkan: E2E_BASE_URL bukan lokal atau preview non-production.",
    );
  }
  return {
    baseUrl: baseUrl.origin,
    testDatabaseUrl: testDatabaseUrl.href,
    authBaseUrl: authUrl.origin,
    targetId: value.E2E_TEST_TARGET_ID,
    users: {
      a: { email: value.E2E_USER_A_EMAIL, password: value.E2E_USER_A_PASSWORD },
      b: { email: value.E2E_USER_B_EMAIL, password: value.E2E_USER_B_PASSWORD },
    },
  };
}
