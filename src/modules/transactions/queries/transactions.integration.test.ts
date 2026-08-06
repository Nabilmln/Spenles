import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { accounts, categories, profiles, transactions } from "@/db/schema";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import { getTestDatabase } from "@/test/database";
import {
  listTransactions,
  getTransactionOptions,
} from "./transactions";

const database = getTestDatabase();
const userA = `tx-search-a-${randomUUID()}`;
const userB = `tx-search-b-${randomUUID()}`;

let accountA = "";
let accountB = "";
let expenseCategoryA = "";
let categoryByNameA = "";
let expenseCategoryB = "";

const baseFilters = {
  q: "",
  type: undefined,
  category: undefined,
  account: undefined,
  month: undefined,
  from: undefined,
  to: undefined,
  sort: "transactionAt" as const,
  direction: "desc" as const,
  page: 1,
  pageSize: 20 as const,
};

beforeAll(async () => {
  await ensureUserFoundationWithDatabase(database, {
    id: userA,
    name: "Search User A",
  });
  await ensureUserFoundationWithDatabase(database, {
    id: userB,
    name: "Search User B",
  });

  const [ownedAccounts, ownedCategories] = await Promise.all([
    database
      .select({ id: accounts.id, userId: accounts.userId })
      .from(accounts)
      .where(inArray(accounts.userId, [userA, userB])),
    database
      .select({ id: categories.id, userId: categories.userId, type: categories.type })
      .from(categories)
      .where(inArray(categories.userId, [userA, userB])),
  ]);

  accountA = ownedAccounts.find((item) => item.userId === userA)!.id;
  accountB = ownedAccounts.find((item) => item.userId === userB)!.id;
  expenseCategoryA = ownedCategories.find(
    (item) => item.userId === userA && item.type === "expense",
  )!.id;
  expenseCategoryB = ownedCategories.find(
    (item) => item.userId === userB && item.type === "expense",
  )!.id;

  const [byNameCategory] = await database
    .insert(categories)
    .values({
      userId: userA,
      name: "Transportasi Harian Zqy",
      normalizedName: "transportasi harian zqy",
      type: "expense",
      status: "active",
    })
    .returning({ id: categories.id });
  categoryByNameA = byNameCategory.id;

  await database.insert(transactions).values([
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 10n,
      transactionAt: new Date("2026-08-01T02:00:00.000Z"),
      note: "abc123 sarapan kopi",
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 30n,
      transactionAt: new Date("2026-08-03T02:00:00.000Z"),
      note: "abc123 makan malam",
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 20n,
      transactionAt: new Date("2026-08-02T02:00:00.000Z"),
      note: "abc123 siang",
    },
    ...Array.from({ length: 8 }, (_, index) => ({
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense" as const,
      amount: 25n,
      transactionAt: new Date(`2026-08-${10 + index}T02:00:00.000Z`),
      note: `abc123 batch ${index + 1}`,
    })),
    {
      userId: userA,
      accountId: accountA,
      categoryId: categoryByNameA,
      type: "expense",
      amount: 40n,
      transactionAt: new Date("2026-08-04T02:00:00.000Z"),
      note: null,
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 5n,
      transactionAt: new Date("2026-08-05T02:00:00.000Z"),
      note: "abc123 yang dihapus",
      deletedAt: new Date("2026-08-06T02:00:00.000Z"),
    },
    {
      userId: userB,
      accountId: accountB,
      categoryId: expenseCategoryB,
      type: "expense",
      amount: 7n,
      transactionAt: new Date("2026-08-03T02:00:00.000Z"),
      note: "abc123 milik user lain",
    },
  ]);
});

afterAll(async () => {
  await database
    .delete(profiles)
    .where(inArray(profiles.userId, [userA, userB]));
});

describe("transaction search and pagination", () => {
  it("finds transactions by note or description", async () => {
    const result = await listTransactions(
      userA,
      { ...baseFilters, q: "abc123" },
      database,
    );

    expect(result.total).toBe(11);
    expect(result.totalPages).toBe(1);
    expect(result.rows).toHaveLength(11);
    expect(result.rows[0].note).toBe("abc123 batch 8");
    expect(result.rows.every((row) => row.note !== "abc123 yang dihapus")).toBe(
      true,
    );
  });

  it("finds transactions by category name", async () => {
    const result = await listTransactions(
      userA,
      { ...baseFilters, q: "zqy" },
      database,
    );

    expect(result.total).toBe(1);
    expect(result.rows[0].note).toBeNull();
    expect(result.rows[0].categoryName).toBe("Transportasi Harian Zqy");
  });

  it("scopes searches to the authenticated user only", async () => {
    const own = await listTransactions(
      userA,
      { ...baseFilters, q: "abc123" },
      database,
    );
    const other = await listTransactions(
      userB,
      { ...baseFilters, q: "abc123" },
      database,
    );

    expect(own.rows.every((row) => row.note !== "abc123 milik user lain")).toBe(
      true,
    );
    expect(other.total).toBe(1);
    expect(other.rows[0].note).toBe("abc123 milik user lain");
  });

  it("preserves pagination while searching", async () => {
    const pageOne = await listTransactions(
      userA,
      { ...baseFilters, q: "abc123", page: 1, pageSize: 10 },
      database,
    );
    const pageTwo = await listTransactions(
      userA,
      { ...baseFilters, q: "abc123", page: 2, pageSize: 10 },
      database,
    );

    expect(pageOne.total).toBe(11);
    expect(pageOne.totalPages).toBe(2);
    expect(pageOne.rows).toHaveLength(10);
    expect(pageTwo.rows).toHaveLength(1);
    expect(
      new Set([...pageOne.rows, ...pageTwo.rows].map((row) => row.id)).size,
    ).toBe(11);
    const firstIds = pageOne.rows.map((row) => row.id);
    expect(
      pageTwo.rows.every((row) => !firstIds.includes(row.id)),
    ).toBe(true);
  });

  it("exposes only owned active accounts and categories as filter options", async () => {
    const options = await getTransactionOptions(userA, undefined, database);

    expect(options.accounts.some((item) => item.id === accountA)).toBe(true);
    expect(options.accounts.some((item) => item.id === accountB)).toBe(false);
    expect(
      options.categories.some((item) => item.id === categoryByNameA),
    ).toBe(true);
    expect(
      options.categories.some((item) => item.id === expenseCategoryB),
    ).toBe(false);
  });
});
