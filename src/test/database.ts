import "server-only";

import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";
import * as schema from "@/db/schema";

const postgresUrl = z.url().refine((value) => value.startsWith("postgres"), {
  message: "harus berupa URL PostgreSQL",
});

const testDatabaseEnvSchema = z.object({
  TEST_DATABASE_URL: postgresUrl,
  DATABASE_URL: postgresUrl.optional(),
  NODE_ENV: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
});

export function parseTestDatabaseEnv(source: Record<string, string | undefined>) {
  const result = testDatabaseEnvSchema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Database integration test dibatalkan: konfigurasi tidak valid (${fields}).`);
  }

  const testUrl = new URL(result.data.TEST_DATABASE_URL);
  const applicationUrl = result.data.DATABASE_URL
    ? new URL(result.data.DATABASE_URL)
    : null;

  if (applicationUrl?.href === testUrl.href) {
    throw new Error(
      "Database integration test dibatalkan: TEST_DATABASE_URL sama dengan DATABASE_URL.",
    );
  }

  if (
    result.data.NODE_ENV === "production" ||
    result.data.VERCEL_ENV === "production" ||
    /(^|[._/-])prod(uction)?([._/-]|$)/iu.test(
      `${testUrl.hostname}${testUrl.pathname}`,
    )
  ) {
    throw new Error(
      "Database integration test dibatalkan: target teridentifikasi sebagai production.",
    );
  }

  return { testDatabaseUrl: testUrl.href };
}

let testDatabase: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getTestDatabase() {
  const { testDatabaseUrl } = parseTestDatabaseEnv(process.env);
  testDatabase ??= drizzle(testDatabaseUrl, { schema });
  return testDatabase;
}

export type TestDatabase = ReturnType<typeof getTestDatabase>;
