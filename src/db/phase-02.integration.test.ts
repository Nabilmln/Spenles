import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const runDatabaseTests = process.env.RUN_DB_TESTS === "1";
const databaseDescribe = runDatabaseTests ? describe : describe.skip;

databaseDescribe("Phase 02 database ownership", () => {
  const userA = `phase02-test-${randomUUID()}`;
  const userB = `phase02-test-${randomUUID()}`;
  let database: Awaited<typeof import("@/db")>["db"];
  let schema: typeof import("@/db/schema");
  let ensureFoundation: typeof import("@/modules/onboarding/services/ensure-user-foundation").ensureUserFoundation;

  beforeAll(async () => {
    config({ path: ".env.local", override: false });
    [{ db: database }, schema, { ensureUserFoundation: ensureFoundation }] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("@/modules/onboarding/services/ensure-user-foundation"),
    ]);
    await Promise.all([
      ensureFoundation({ id: userA, name: "Phase 02 A" }),
      ensureFoundation({ id: userB, name: "Phase 02 B" }),
    ]);
  });

  afterAll(async () => {
    if (!database || !schema) return;
    const { inArray } = await import("drizzle-orm");
    await database.delete(schema.profiles).where(inArray(schema.profiles.userId, [userA, userB]));
  });

  it("provisions foundations idempotently", async () => {
    const result = await ensureFoundation({ id: userA, name: "Phase 02 A" });
    expect(result).toMatchObject({ accountCount: 1, categoryCount: 20 });
  });

  it("rejects an account owned by another user", async () => {
    const { and, eq } = await import("drizzle-orm");
    const account = await database.query.accounts.findFirst({ where: eq(schema.accounts.userId, userA) });
    const category = await database.query.categories.findFirst({
      where: and(eq(schema.categories.userId, userB), eq(schema.categories.type, "expense")),
    });
    await expect(database.insert(schema.transactions).values({
      userId: userB,
      accountId: account!.id,
      categoryId: category!.id,
      type: "expense",
      amount: BigInt(1000),
      transactionAt: new Date(),
    })).rejects.toBeTruthy();
  });

  it("preserves transaction references after category archival", async () => {
    const { and, eq } = await import("drizzle-orm");
    const account = await database.query.accounts.findFirst({ where: eq(schema.accounts.userId, userA) });
    const category = await database.query.categories.findFirst({
      where: and(eq(schema.categories.userId, userA), eq(schema.categories.type, "expense")),
    });
    const [transaction] = await database.insert(schema.transactions).values({
      userId: userA,
      accountId: account!.id,
      categoryId: category!.id,
      type: "expense",
      amount: BigInt(1000),
      transactionAt: new Date(),
    }).returning();
    await database.update(schema.categories).set({ status: "archived" }).where(
      and(eq(schema.categories.id, category!.id), eq(schema.categories.userId, userA)),
    );
    const retained = await database.query.transactions.findFirst({
      where: and(eq(schema.transactions.id, transaction.id), eq(schema.transactions.userId, userA)),
    });
    expect(retained?.categoryId).toBe(category!.id);
  });
});
