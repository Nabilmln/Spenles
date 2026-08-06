import { pathToFileURL } from "node:url";
import { config } from "dotenv";

const PLACEHOLDER = /replace|placeholder|example\.com|your-|password@|test-host/iu;

function required(source, key, issues) {
  const value = source[key]?.trim();
  if (!value) issues.push(`${key} tidak tersedia`);
  return value;
}

function validUrl(value, protocols) {
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function validateReleaseEnvironment(source) {
  const issues = [];
  const database = required(source, "DATABASE_URL", issues);
  const authUrlValue = required(source, "NEON_AUTH_BASE_URL", issues);
  const cookieSecret = required(source, "NEON_AUTH_COOKIE_SECRET", issues);
  const cronSecret = required(source, "CRON_SECRET", issues);
  const appName = required(source, "NEXT_PUBLIC_APP_NAME", issues);
  const appUrlValue = required(source, "NEXT_PUBLIC_APP_URL", issues);
  const production =
    source.NODE_ENV === "production" || source.VERCEL_ENV === "production";

  const databaseUrl = database
    ? validUrl(database, ["postgres:", "postgresql:"])
    : null;
  const authUrl = authUrlValue
    ? validUrl(authUrlValue, ["http:", "https:"])
    : null;
  const appUrl = appUrlValue
    ? validUrl(appUrlValue, ["http:", "https:"])
    : null;
  if (database && !databaseUrl) issues.push("DATABASE_URL bukan URL PostgreSQL");
  if (authUrlValue && !authUrl) issues.push("NEON_AUTH_BASE_URL bukan URL HTTP(S)");
  if (appUrlValue && !appUrl) issues.push("NEXT_PUBLIC_APP_URL bukan URL HTTP(S)");
  if (cookieSecret && cookieSecret.length < 32) {
    issues.push("NEON_AUTH_COOKIE_SECRET kurang dari 32 karakter");
  }
  if (cronSecret && cronSecret.length < 32) {
    issues.push("CRON_SECRET kurang dari 32 karakter");
  }
  for (const [name, value] of [
    ["DATABASE_URL", database],
    ["NEON_AUTH_BASE_URL", authUrlValue],
    ["NEON_AUTH_COOKIE_SECRET", cookieSecret],
    ["CRON_SECRET", cronSecret],
    ["NEXT_PUBLIC_APP_URL", appUrlValue],
  ]) {
    if (value && PLACEHOLDER.test(value)) issues.push(`${name} masih placeholder`);
  }
  if (appName !== undefined && appName !== "Spenles") {
    issues.push("NEXT_PUBLIC_APP_NAME harus Spenles");
  }
  if (production) {
    if (authUrl?.protocol !== "https:") {
      issues.push("NEON_AUTH_BASE_URL production wajib HTTPS");
    }
    if (appUrl?.protocol !== "https:") {
      issues.push("NEXT_PUBLIC_APP_URL production wajib HTTPS");
    }
    if (appUrl?.hostname === "localhost" || appUrl?.hostname === "127.0.0.1") {
      issues.push("NEXT_PUBLIC_APP_URL production tidak boleh lokal");
    }
  } else if (
    appUrl &&
    appUrl.protocol === "http:" &&
    appUrl.hostname !== "localhost" &&
    appUrl.hostname !== "127.0.0.1"
  ) {
    issues.push("URL aplikasi HTTP hanya diizinkan untuk host lokal");
  }
  const testDatabase = source.TEST_DATABASE_URL?.trim();
  if (testDatabase) {
    const testUrl = validUrl(testDatabase, ["postgres:", "postgresql:"]);
    if (!testUrl) issues.push("TEST_DATABASE_URL bukan URL PostgreSQL");
    if (databaseUrl && testUrl?.href === databaseUrl.href) {
      issues.push("TEST_DATABASE_URL tidak boleh sama dengan DATABASE_URL");
    }
  }
  return { success: issues.length === 0, issues, production };
}

async function main() {
  config({ path: ".env.local", override: false, quiet: true });
  const result = validateReleaseEnvironment(process.env);
  if (!result.success) {
    process.stderr.write(
      `Validasi environment gagal:\n${result.issues
        .map((issue) => `- ${issue}`)
        .join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Environment ${result.production ? "production" : "non-production"} valid; nilai rahasia tidak ditampilkan.\n`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
