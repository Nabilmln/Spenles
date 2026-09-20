import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { categories, profiles, transactions } from "@/db/schema";
import { getTestDatabase } from "@/test/database";
import {
  setOwnedCategoryStatus,
  updateOwnedCategory,
} from "@/modules/categories/services/category-mutations";
import { normalizeCategoryName } from "@/modules/categories/services/normalize-category-name";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import {
  createOwnedTransaction,
  softDeleteOwnedTransaction,
  updateOwnedTransaction,
  type TransactionMutationInput,
} from "@/modules/transactions/services/transaction-mutations";

const database = getTestDatabase();
const userA = `phase02-test-${randomUUID()}`;
const userB = `phase02-test-${randomUUID()}`;

let accountA: string;
let accountB: string;
let expenseCategoryA: string;
let expenseCategoryB: string;
let incomeCategoryA: string;

function transactionInput(
  overrides: Partial<TransactionMutationInput> = {},
): TransactionMutationInput {
  return {
    type: "expense",
    amount: BigInt(10_000),
    accountId: accountA,
    categoryId: expenseCategoryA,
    transactionAt: new Date("2026-08-01T05:00:00.000Z"),
    note: "fixture phase 02",
    ...overrides,
  };
}

describe("Phase 02 database mutations", () => {
  beforeAll(async () => {
    await Promise.all([
      ensureUserFoundationWithDatabase(database, { id: userA, name: "Phase 02 A" }),
      ensureUserFoundationWithDatabase(database, { id: userB, name: "Phase 02 B" }),
    ]);

    const [ownedAccountA, ownedAccountB, ownedExpenseA, ownedExpenseB, ownedIncomeA] =
      await Promise.all([
        database.query.accounts.findFirst({ where: (table, { eq }) => eq(table.userId, userA) }),
        database.query.accounts.findFirst({ where: (table, { eq }) => eq(table.userId, userB) }),
        database.query.categories.findFirst({
          where: (table, { and, eq }) => and(eq(table.userId, userA), eq(table.type, "expense")),
        }),
        database.query.categories.findFirst({
          where: (table, { and, eq }) => and(eq(table.userId, userB), eq(table.type, "expense")),
        }),
        database.query.categories.findFirst({
          where: (table, { and, eq }) => and(eq(table.userId, userA), eq(table.type, "income")),
        }),
      ]);

    accountA = ownedAccountA!.id;
    accountB = ownedAccountB!.id;
    expenseCategoryA = ownedExpenseA!.id;
    expenseCategoryB = ownedExpenseB!.id;
    incomeCategoryA = ownedIncomeA!.id;
  });

  afterAll(async () => {
    await database
      .delete(profiles)
      .where(inArray(profiles.userId, [userA, userB]));
  });

  it("provisions foundations idempotently", async () => {
    const result = await ensureUserFoundationWithDatabase(database, {
      id: userA,
      name: "Phase 02 A",
    });
    expect(result).toMatchObject({ accountCount: 1, categoryCount: 20 });
  });

  it("lets user A create and update user A's transaction", async () => {
    const created = await createOwnedTransaction(database, userA, transactionInput());
    expect(created?.id).toEqual(expect.any(String));

    const updated = await updateOwnedTransaction(
      database,
      userA,
      created!.id,
      transactionInput({ amount: BigInt(25_000), note: "updated" }),
    );
    expect(updated?.id).toBe(created!.id);

    const row = await database.query.transactions.findFirst({
      where: and(eq(transactions.id, created!.id), eq(transactions.userId, userA)),
    });
    expect(row).toMatchObject({ amount: BigInt(25_000), note: "updated" });
  });

  it("rejects another user's account and category during creation", async () => {
    await expect(
      createOwnedTransaction(database, userA, transactionInput({ accountId: accountB })),
    ).resolves.toBeNull();
    await expect(
      createOwnedTransaction(database, userA, transactionInput({ categoryId: expenseCategoryB })),
    ).resolves.toBeNull();
  });

  it("rejects category-type mismatch", async () => {
    await expect(
      createOwnedTransaction(database, userA, transactionInput({ categoryId: incomeCategoryA })),
    ).resolves.toBeNull();
  });

  it("prevents user A from updating or deleting user B's transaction", async () => {
    const created = await createOwnedTransaction(
      database,
      userB,
      transactionInput({
        accountId: accountB,
        categoryId: expenseCategoryB,
      }),
    );

    await expect(
      updateOwnedTransaction(database, userA, created!.id, transactionInput()),
    ).resolves.toBeNull();
    await expect(
      softDeleteOwnedTransaction(database, userA, created!.id),
    ).resolves.toBeNull();
  });

  it("fails safely for nonexistent transaction IDs", async () => {
    const missingId = randomUUID();
    await expect(
      updateOwnedTransaction(database, userA, missingId, transactionInput()),
    ).resolves.toBeNull();
    await expect(
      softDeleteOwnedTransaction(database, userA, missingId),
    ).resolves.toBeNull();
  });

  it("soft-deletes only an owned active transaction and verifies the row", async () => {
    const created = await createOwnedTransaction(database, userA, transactionInput());
    await expect(
      softDeleteOwnedTransaction(database, userA, created!.id),
    ).resolves.toEqual({ id: created!.id });
    await expect(
      softDeleteOwnedTransaction(database, userA, created!.id),
    ).resolves.toBeNull();

    const row = await database.query.transactions.findFirst({
      where: eq(transactions.id, created!.id),
    });
    expect(row?.deletedAt).toBeInstanceOf(Date);
  });

  it("scopes category updates and archival by authenticated owner", async () => {
    const [personalCategory] = await database
      .insert(categories)
      .values({
        userId: userA,
        name: "Kategori Integrasi",
        normalizedName: normalizeCategoryName("Kategori Integrasi"),
        type: "expense",
      })
      .returning({ id: categories.id });

    await expect(
      updateOwnedCategory(database, userA, personalCategory.id, {
        name: "Kategori Diperbarui",
        normalizedName: normalizeCategoryName("Kategori Diperbarui"),
        icon: null,
        color: null,
      }),
    ).resolves.toEqual({ id: personalCategory.id });
    await expect(
      updateOwnedCategory(database, userB, personalCategory.id, {
        name: "Tidak Diizinkan",
        normalizedName: normalizeCategoryName("Tidak Diizinkan"),
        icon: null,
        color: null,
      }),
    ).resolves.toBeNull();
    await expect(
      setOwnedCategoryStatus(database, userA, personalCategory.id, "archived"),
    ).resolves.toEqual({ ok: true, id: personalCategory.id });
    await expect(
      setOwnedCategoryStatus(database, userB, personalCategory.id, "active"),
    ).resolves.toEqual({ ok: false, reason: "not-found" });
    await expect(
      updateOwnedCategory(database, userA, randomUUID(), {
        name: "Tidak Ada",
        normalizedName: normalizeCategoryName("Tidak Ada"),
        icon: null,
        color: null,
      }),
    ).resolves.toBeNull();
  });

  it("preserves transaction references after category archival", async () => {
    const created = await createOwnedTransaction(database, userA, transactionInput());
    await setOwnedCategoryStatus(database, userA, expenseCategoryA, "archived");

    const retained = await database.query.transactions.findFirst({
      where: and(eq(transactions.id, created!.id), eq(transactions.userId, userA)),
    });
    expect(retained?.categoryId).toBe(expenseCategoryA);

    await setOwnedCategoryStatus(database, userA, expenseCategoryA, "active");
  });

  it("returns a safe duplicate result when category restore conflicts", async () => {
    const duplicateName = `Duplikat ${randomUUID()}`;
    const normalizedName = normalizeCategoryName(duplicateName);
    const [archivedCategory] = await database
      .insert(categories)
      .values({
        userId: userA,
        name: duplicateName,
        normalizedName,
        type: "expense",
        status: "archived",
      })
      .returning({ id: categories.id });
    await database.insert(categories).values({
      userId: userA,
      name: duplicateName,
      normalizedName,
      type: "expense",
      status: "active",
    });

    await expect(
      setOwnedCategoryStatus(database, userA, archivedCategory.id, "active"),
    ).resolves.toEqual({ ok: false, reason: "duplicate" });
  });
});
