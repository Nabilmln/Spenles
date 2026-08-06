import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { accounts, categories, profiles, transactions } from "@/db/schema";
import { createOwnedAccount } from "@/modules/accounts/services/account-mutations";
import { createOwnedTransfer } from "@/modules/accounts/services/transfer-mutations";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import { getPersonalDataBackupJson } from "@/modules/reports/queries/backup-query";
import {
  getFinancialReport,
  listCsvTransactions,
  validateOwnedReportFilters,
} from "@/modules/reports/queries/report-queries";
import { REPORT_DETAIL_LIMIT } from "@/modules/reports/constants";
import { ExportLimitError } from "@/modules/reports/services/csv";
import { parseReportParams } from "@/modules/reports/schemas/export-params";
import {
  createOwnedTransaction,
  softDeleteOwnedTransaction,
} from "@/modules/transactions/services/transaction-mutations";
import { getTestDatabase } from "@/test/database";

describe("Phase 06 authenticated reports and exports", () => {
  const database = getTestDatabase();
  const userA = `phase06-test-a-${randomUUID()}`;
  const userB = `phase06-test-b-${randomUUID()}`;
  let accountA: string;
  let accountA2: string;
  let foreignAccount: string;
  let incomeCategory: string;
  let expenseCategory: string;
  let deletedTransactionId: string;

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
    deletedTransactionId = deleted!.id;
    await softDeleteOwnedTransaction(database, userA, deletedTransactionId);
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

  const filters = parseReportParams(
    new URLSearchParams("period=month&month=2026-08&details=true"),
    new Date("2026-08-06T06:00:00.000Z"),
  )!;

  it("rejects a foreign account filter without revealing its existence", async () => {
    await expect(
      validateOwnedReportFilters(
        userA,
        { ...filters, accountId: foreignAccount },
        database,
      ),
    ).resolves.toBe(false);
  });

  it("scopes totals, excludes deleted rows and transfers, and reconciles categories", async () => {
    const report = await getFinancialReport(
      userA,
      "Phase 06 A",
      filters,
      database,
      new Date("2026-08-06T06:00:00.000Z"),
    );
    expect(report.summary).toEqual({
      incomeIdr: "100000",
      expenseIdr: "25000",
      netIdr: "75000",
    });
    expect(
      report.categories.reduce(
        (sum, category) => sum + BigInt(category.amountIdr),
        0n,
      ),
    ).toBe(25_000n);
    expect(report.transactions.map((row) => row.amountIdr).sort()).toEqual([
      "100000",
      "25000",
    ]);
    const source = report.accounts.find((row) => row.accountId === accountA);
    const destination = report.accounts.find((row) => row.accountId === accountA2);
    expect(source?.closingBalanceIdr).toBe("55000");
    expect(destination?.closingBalanceIdr).toBe("20000");
  });

  it("exports only active owned CSV rows in deterministic order", async () => {
    const rows = await listCsvTransactions(userA, filters, 10_001, database);
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.note !== "Milik user B")).toBe(true);
    expect(rows.map((row) => row.transactionAt.toISOString())).toEqual([
      "2026-08-02T02:00:00.000Z",
      "2026-08-03T03:00:00.000Z",
    ]);
  });

  it("produces one versioned allowlisted snapshot including deleted personal data", async () => {
    const text = await getPersonalDataBackupJson(
      userA,
      new Date("2026-08-06T06:00:00.000Z"),
      database,
    );
    const backup = JSON.parse(text) as {
      schemaVersion: string;
      data: {
        transactions: Array<{ id: string; deletedAt: string | null }>;
      };
    };
    expect(backup.schemaVersion).toBe("1.0");
    expect(
      backup.data.transactions.find((row) => row.id === deletedTransactionId)
        ?.deletedAt,
    ).toBeTruthy();
    expect(text).not.toMatch(/"userId"|"systemKey"|"normalizedName"/u);
    expect(text).not.toContain("Milik user B");
  });

  it("accepts exactly REPORT_DETAIL_LIMIT detail rows and rejects one more", async () => {
    const rows = Array.from(
      { length: REPORT_DETAIL_LIMIT + 1 },
      (_, index) => ({
        id: randomUUID(),
        userId: userA,
        accountId: accountA,
        categoryId: expenseCategory,
        type: "expense" as const,
        amount: 1_000n,
        transactionAt: new Date(
          Date.UTC(2026, 8, 1, 0, index % 24, index % 60),
        ),
        note: `Batas detail ${index}`,
      }),
    );
    await database.insert(transactions).values(rows.slice(0, REPORT_DETAIL_LIMIT));
    const atLimit = await getFinancialReport(
      userA,
      "Phase 06 A",
      parseReportParams(
        new URLSearchParams(
          "period=month&month=2026-09&details=true",
        ),
        new Date("2026-09-02T02:00:00.000Z"),
      )!,
      database,
      new Date("2026-09-02T02:00:00.000Z"),
    );
    expect(atLimit.transactions).toHaveLength(REPORT_DETAIL_LIMIT);

    await database.insert(transactions).values([rows[REPORT_DETAIL_LIMIT]]);
    await expect(
      getFinancialReport(
        userA,
        "Phase 06 A",
        parseReportParams(
          new URLSearchParams(
            "period=month&month=2026-09&details=true",
          ),
          new Date("2026-09-02T02:00:00.000Z"),
        )!,
        database,
        new Date("2026-09-02T02:00:00.000Z"),
      ),
    ).rejects.toThrow(ExportLimitError);
  });
});
