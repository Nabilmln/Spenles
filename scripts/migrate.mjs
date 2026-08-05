import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local", override: false, quiet: true });

const useTestDatabase = process.argv.includes("--test");
const variableName = useTestDatabase ? "TEST_DATABASE_URL" : "DATABASE_URL";
const connectionString = process.env[variableName];

if (!connectionString?.startsWith("postgres")) {
  throw new Error(`${variableName} is not configured as a PostgreSQL URL.`);
}

if (useTestDatabase) {
  if (connectionString === process.env.DATABASE_URL) {
    throw new Error(
      "Test migration cancelled: TEST_DATABASE_URL equals DATABASE_URL.",
    );
  }
  const target = new URL(connectionString);
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    /(^|[._/-])prod(uction)?([._/-]|$)/iu.test(
      `${target.hostname}${target.pathname}`,
    )
  ) {
    throw new Error(
      "Test migration cancelled: target is classified as production.",
    );
  }
}

const journal = JSON.parse(
  await readFile(resolve("drizzle/meta/_journal.json"), "utf8"),
);
const client = neon(connectionString);

await client.transaction((transaction) => [
  transaction.query("create schema if not exists drizzle"),
  transaction.query(`
    create table if not exists drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    )
  `),
]);

const applied = await client.query(
  "select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1",
);
const lastApplied = Number(applied[0]?.created_at ?? 0);
const pending = journal.entries.filter((entry) => entry.when > lastApplied);

for (const entry of pending) {
  const migrationPath = resolve("drizzle", `${entry.tag}.sql`);
  const source = await readFile(migrationPath, "utf8");
  const statements = source
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);
  const hash = createHash("sha256").update(source).digest("hex");
  await client.transaction(
    (transaction) => [
      transaction.query("select pg_advisory_xact_lock($1)", [7_319_045]),
      ...statements.map((statement) => transaction.query(statement)),
      transaction.query(
        "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
        [hash, entry.when],
      ),
    ],
    { isolationLevel: "Serializable" },
  );
  console.log(`Applied ${entry.tag}`);
}

if (pending.length === 0) {
  console.log("No pending migrations.");
}
