import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { accounts, categories, profiles } from "@/db/schema";
import { createOwnedAccount } from "@/modules/accounts/services/account-mutations";
import { createOwnedTransfer } from "@/modules/accounts/services/transfer-mutations";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import { getReportAnalysis, getReportCategoryBreakdown } from "@/modules/reports/queries/report-queries";
import {
  createOwnedTransaction,
  softDeleteOwnedTransaction,
} from "@/modules/transactions/services/transaction-mutations";
import { getTestDatabase } from "@/test/database";

describe("Phase 06 authenticated reports", () => {
  const database = getTestDatabase();
  const userA = `phase06-test-a-${randomUUID()}`;
  const userB = `phase06-test-b-${randomUUID()}`;
  let accountA: string;
  let accountA2: string;
  let foreignAccount: string;
  let incomeCategory: string;
  let expenseCategory: string;

  beforeAll(async () => {
    await ensureUserFoundationWithDatabase(database, {
      id: userA,
      name: "Phase 06 A",
    });
    await ensureUserFoundationWithDatabase(database, {
      id: userB,
      name: "Phase 06 B",
    });
    accountA = (
      await database
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.userId, userA))
        .limit(1)
    )[0]!.id;
    foreignAccount = (
      await database
        .select({ id: accounts.id })
        .from(accounts)
        .where(eq(accounts.userId, userB))
        .limit(1)
    )[0]!.id;
    accountA2 = (
      await createOwnedAccount(database, userA, {
        name: "Bank Laporan",
        type: "bank",
        openingBalance: 0n,
      })
    )!.id;
    const ownedCategories = await database
      .select({ id: categories.id, type: categories.type })
      .from(categories)
      .where(eq(categories.userId, userA));
    incomeCategory = ownedCategories.find((row) => row.type === "income")!.id;
    expenseCategory = ownedCategories.find((row) => row.type === "expense")!.id;
    const foreignCategories = await database
      .select({ id: categories.id, type: categories.type })
      .from(categories)
      .where(eq(categories.userId, userB));

    await createOwnedTransaction(database, userA, {
      accountId: accountA,
      categoryId: incomeCategory,
      type: "income",
      amount: 100_000n,
      transactionAt: new Date("2026-08-02T02:00:00.000Z"),
      note: "=formula-income",
    });
    await createOwnedTransaction(database, userA, {
      accountId: accountA,
      categoryId: expenseCategory,
      type: "expense",
      amount: 25_000n,
      transactionAt: new Date("2026-08-03T03:00:00.000Z"),
      note: "Makan siang",
    });
    const deleted = await createOwnedTransaction(database, userA, {
      accountId: accountA,
      categoryId: expenseCategory,
      type: "expense",
      amount: 999_000n,
      transactionAt: new Date("2026-08-04T04:00:00.000Z"),
      note: "Dihapus",
    });
    await softDeleteOwnedTransaction(database, userA, deleted!.id);
    await createOwnedTransaction(database, userB, {
      accountId: foreignAccount,
      categoryId: foreignCategories.find((row) => row.type === "expense")!.id,
      type: "expense",
      amount: 7_000_000n,
      transactionAt: new Date("2026-08-03T03:00:00.000Z"),
      note: "Milik user B",
    });
    await createOwnedTransfer(database, userA, {
      sourceAccountId: accountA,
      destinationAccountId: accountA2,
      amount: 20_000n,
      transferredAt: new Date("2026-08-05T05:00:00.000Z"),
      note: "Transfer internal",
    });
  });

  afterAll(async () => {
    await database
      .delete(profiles)
      .where(inArray(profiles.userId, [userA, userB]));
  });

  it("scopes totals, excludes deleted rows and transfers, and reconciles categories", async () => {
    const report = await getReportAnalysis(
      userA, "2026-08-01", "2026-08-31", database,
    );
    const breakdown = await getReportCategoryBreakdown(
      userA, "2026-08-01", "2026-08-31", "expense", undefined, database,
    );
    expect(report.summary).toEqual({
      incomeIdr: "100000",
      expenseIdr: "25000",
      netIdr: "75000",
    });
    expect(
      breakdown.categories.reduce(
        (sum, category) => sum + BigInt(category.amountIdr),
        0n,
      ),
    ).toBe(25_000n);
    expect(breakdown.totalIdr).toBe("25000");
  });

});
