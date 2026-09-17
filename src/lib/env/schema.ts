import { z } from "zod";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.url().refine((value) => value.startsWith("postgres"), {
    message: "DATABASE_URL harus berupa URL PostgreSQL.",
  }),
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    const names = result.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ");
    throw new Error(`Konfigurasi server tidak valid: ${names}`);
  }

  return result.data;
}
