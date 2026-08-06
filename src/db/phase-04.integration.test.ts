import { randomUUID } from "node:crypto";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  categories,
  profiles,
  recurringGenerations,
  transactions,
  transfers,
} from "@/db/schema";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import {
  createOwnedAccount,
  setOwnedAccountStatus,
} from "@/modules/accounts/services/account-mutations";
import {
  createOwnedTransfer,
  reverseOwnedTransfer,
} from "@/modules/accounts/services/transfer-mutations";
import {
  getOwnedAccount,
  listOwnedAccounts,
} from "@/modules/accounts/queries/accounts";
import {
  createOwnedBudget,
  setOwnedBudgetStatus,
} from "@/modules/budgets/services/budget-mutations";
import { listOwnedBudgets } from "@/modules/budgets/queries/budgets";
import { createOwnedTransaction, softDeleteOwnedTransaction } from "@/modules/transactions/services/transaction-mutations";
import { createOwnedRecurringRule } from "@/modules/recurring-transactions/services/recurring-mutations";
import { generateOccurrence } from "@/modules/recurring-transactions/services/generate-occurrence";
import { getSelectedAndPreviousTotals } from "@/modules/dashboard/queries/dashboard-queries";
import { getTestDatabase } from "@/test/database";

describe("Phase 04 financial domains", () => {
  const database = getTestDatabase();
  const userA = `phase04-test-a-${randomUUID()}`;
  const userB = `phase04-test-b-${randomUUID()}`;
  let accountA: string;
  let accountB: string;
  let foreignAccount: string;
  let expenseCategory: string;
  let incomeCategory: string;

  beforeAll(async () => {
    await ensureUserFoundationWithDatabase(database, {
      id: userA,
      name: "Phase 04 A",
    });
    await ensureUserFoundationWithDatabase(database, {
      id: userB,
      name: "Phase 04 B",
    });
    const ownedAccounts = await listOwnedAccounts(userA, database);
    accountA = ownedAccounts[0]!.id;
    foreignAccount = (await listOwnedAccounts(userB, database))[0]!.id;
    accountB = (
      await createOwnedAccount(database, userA, {
        name: "Bank uji",
        type: "bank",
        openingBalance: 1_000_000n,
      })
    )!.id;
    const ownedCategories = await database
      .select({ id: categories.id, type: categories.type })
      .from(categories)
      .where(eq(categories.userId, userA));
    expenseCategory = ownedCategories.find((item) => item.type === "expense")!.id;
    incomeCategory = ownedCategories.find((item) => item.type === "income")!.id;
  });

  it("has the Phase 04 enums, indexes, and constraints", async () => {
    const enumValues = await database.execute<{ enumlabel: string }>(sql`
      select enumlabel
      from pg_enum
      inner join pg_type on pg_type.oid = pg_enum.enumtypid
      where pg_type.typname = 'account_type'
      order by pg_enum.enumsortorder
    `);
    expect(enumValues.rows.map((row) => row.enumlabel)).toEqual([
      "cash",
      "bank",
      "e_wallet",
      "savings",
      "other",
    ]);

    const indexes = await database.execute<{ indexname: string }>(sql`
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'budgets_user_category_month_active_uidx',
          'transfers_reversal_of_uidx',
          'recurring_generations_rule_scheduled_uidx',
          'recurring_rules_due_idx'
        )
    `);
    expect(indexes.rows.map((row) => row.indexname).sort()).toEqual([
      "budgets_user_category_month_active_uidx",
      "recurring_generations_rule_scheduled_uidx",
      "recurring_rules_due_idx",
      "transfers_reversal_of_uidx",
    ]);

    const constraints = await database.execute<{ conname: string }>(sql`
      select conname
      from pg_constraint
      where conname in (
        'accounts_opening_balance_safe',
        'budgets_category_owner_fk',
        'recurring_rules_category_owner_type_fk',
        'transfers_source_account_owner_fk',
        'transfers_destination_account_owner_fk'
      )
    `);
    expect(constraints.rows.map((row) => row.conname).sort()).toEqual([
      "accounts_opening_balance_safe",
      "budgets_category_owner_fk",
      "recurring_rules_category_owner_type_fk",
      "transfers_destination_account_owner_fk",
      "transfers_source_account_owner_fk",
    ]);
  });

  afterAll(async () => {
    await database
      .delete(profiles)
      .where(inArray(profiles.userId, [userA, userB]));
  });

  it("derives exact balances from transactions and transfers", async () => {
    await createOwnedTransaction(database, userA, {
      type: "income",
      amount: 500_000n,
      accountId: accountA,
      categoryId: incomeCategory,
      transactionAt: new Date("2026-08-05T00:00:00Z"),
      note: null,
    });
    await createOwnedTransaction(database, userA, {
      type: "expense",
      amount: 100_000n,
      accountId: accountA,
      categoryId: expenseCategory,
      transactionAt: new Date("2026-08-05T01:00:00Z"),
      note: null,
    });
    await createOwnedTransfer(database, userA, {
      sourceAccountId: accountA,
      destinationAccountId: accountB,
      amount: 200_000n,
      transferredAt: new Date("2026-08-05T02:00:00Z"),
      note: null,
    });
    const first = await getOwnedAccount(userA, accountA, database);
    const second = await getOwnedAccount(userA, accountB, database);
    expect(first?.balance).toBe("200000");
    expect(second?.balance).toBe("1200000");
  });

  it("rejects cross-user transfer relationships", async () => {
    await expect(
      createOwnedTransfer(database, userA, {
        sourceAccountId: accountA,
        destinationAccountId: foreignAccount,
        amount: 1n,
        transferredAt: new Date("2026-08-05T03:00:00Z"),
        note: null,
      }),
    ).resolves.toBeNull();
  });

  it("keeps transfers out of dashboard income and expense", async () => {
    const interval = {
      start: new Date("2026-08-01T00:00:00Z"),
      end: new Date("2026-09-01T00:00:00Z"),
      startDate: "2026-08-01",
      endDateExclusive: "2026-09-01",
      label: "Agustus",
    };
    const previous = {
      start: new Date("2026-07-01T00:00:00Z"),
      end: interval.start,
      startDate: "2026-07-01",
      endDateExclusive: "2026-08-01",
      label: "Juli",
    };
    const before = await getSelectedAndPreviousTotals(
      userA,
      interval,
      previous,
      database,
    );
    await createOwnedTransfer(database, userA, {
      sourceAccountId: accountB,
      destinationAccountId: accountA,
      amount: 12_345n,
      transferredAt: new Date("2026-08-06T00:00:00Z"),
      note: null,
    });
    const after = await getSelectedAndPreviousTotals(
      userA,
      interval,
      previous,
      database,
    );
    expect(after).toEqual(before);
  });

  it("creates one immutable compensating reversal", async () => {
    const original = await createOwnedTransfer(database, userA, {
      sourceAccountId: accountA,
      destinationAccountId: accountB,
      amount: 77_000n,
      transferredAt: new Date("2026-08-07T00:00:00Z"),
      note: "Koreksi",
    });
    const first = await reverseOwnedTransfer(database, userA, original!.id);
    const second = await reverseOwnedTransfer(database, userA, original!.id);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    const rows = await database
      .select()
      .from(transfers)
      .where(eq(transfers.reversalOfId, original!.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.sourceAccountId).toBe(accountB);
    expect(rows[0]?.destinationAccountId).toBe(accountA);
  });

  it("preserves at least one active account and scopes archival", async () => {
    await expect(
      setOwnedAccountStatus(database, userB, accountA, "archived"),
    ).resolves.toEqual({ ok: false, reason: "last-active-or-not-found" });
    await expect(
      setOwnedAccountStatus(database, userB, foreignAccount, "archived"),
    ).resolves.toEqual({ ok: false, reason: "last-active-or-not-found" });
    await expect(
      setOwnedAccountStatus(database, userA, accountB, "archived"),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      setOwnedAccountStatus(database, userA, accountA, "archived"),
    ).resolves.toEqual({ ok: false, reason: "last-active-or-not-found" });
    await setOwnedAccountStatus(database, userA, accountB, "active");
  });

  it("enforces active budget uniqueness and exact usage", async () => {
    const month = `2027-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-01`;
    const first = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      budgetMonth: month,
      amount: 100_000n,
      warningThresholdBps: 8000,
    });
    const duplicate = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      budgetMonth: month,
      amount: 200_000n,
      warningThresholdBps: 8000,
    });
    expect(first.ok).toBe(true);
    expect(duplicate).toEqual({ ok: false, reason: "duplicate" });

    const transactionAt = new Date(`${month.slice(0, 7)}-15T00:00:00+07:00`);
    const activeTransaction = await createOwnedTransaction(database, userA, {
      type: "expense",
      amount: 80_000n,
      accountId: accountA,
      categoryId: expenseCategory,
      transactionAt,
      note: null,
    });
    const deletedTransaction = await createOwnedTransaction(database, userA, {
      type: "expense",
      amount: 20_000n,
      accountId: accountA,
      categoryId: expenseCategory,
      transactionAt,
      note: null,
    });
    await softDeleteOwnedTransaction(database, userA, deletedTransaction!.id);
    const rows = await listOwnedBudgets(userA, database);
    const budget = rows.find((item) => item.id === (first.ok ? first.id : ""));
    expect(budget?.usage).toBe("80000");
    expect(budget?.budgetStatus).toBe("warning");
    expect(activeTransaction).not.toBeNull();
  });

  it("restores an archived budget only without an active conflict", async () => {
    const month = "2028-01-01";
    const archived = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      budgetMonth: month,
      amount: 1n,
      warningThresholdBps: 8000,
    });
    await setOwnedBudgetStatus(database, userA, archived.ok ? archived.id : "", "archived");
    await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      budgetMonth: month,
      amount: 2n,
      warningThresholdBps: 8000,
    });
    await expect(
      setOwnedBudgetStatus(database, userA, archived.ok ? archived.id : "", "active"),
    ).resolves.toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects a recurring rule with another user's account", async () => {
    await expect(
      createOwnedRecurringRule(database, userA, {
        type: "expense",
        amount: 1n,
        accountId: foreignAccount,
        categoryId: expenseCategory,
        frequency: "daily",
        startAt: new Date("2026-08-01T00:00:00Z"),
        endDate: null,
        nextOccurrenceAt: new Date("2026-08-02T00:00:00Z"),
        note: null,
      }),
    ).resolves.toBeNull();
  });

  it("generates one transaction and marker under concurrent calls", async () => {
    const scheduledFor = new Date("2026-08-01T00:00:00Z");
    const created = await createOwnedRecurringRule(database, userA, {
      type: "income",
      amount: 333n,
      accountId: accountA,
      categoryId: incomeCategory,
      frequency: "daily",
      startAt: scheduledFor,
      endDate: "2026-08-01",
      nextOccurrenceAt: scheduledFor,
      note: "Terjadwal",
    });
    const due = {
      id: created!.id,
      userId: userA,
      startAt: scheduledFor,
      endDate: "2026-08-01",
      frequency: "daily" as const,
      scheduledFor,
    };
    const results = await Promise.all([
      generateOccurrence(database, due, null, new Date("2026-08-02T00:00:00Z")),
      generateOccurrence(database, due, null, new Date("2026-08-02T00:00:00Z")),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([
      "duplicate",
      "generated",
    ]);
    const [generationCount, transactionCount] = await Promise.all([
      database
        .select({ value: count() })
        .from(recurringGenerations)
        .where(eq(recurringGenerations.recurringRuleId, created!.id)),
      database
        .select({ value: count() })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userA),
            eq(transactions.note, "Terjadwal"),
          ),
        ),
    ]);
    expect(generationCount[0]?.value).toBe(1);
    expect(transactionCount[0]?.value).toBe(1);
  });

  it("keeps occurrence uniqueness after generated transaction deletion", async () => {
    const generation = await database.query.recurringGenerations.findFirst({
      where: eq(recurringGenerations.userId, userA),
      orderBy: (table, { desc }) => [desc(table.generatedAt)],
    });
    expect(generation).toBeDefined();
    await softDeleteOwnedTransaction(database, userA, generation!.transactionId);
    const marker = await database
      .select()
      .from(recurringGenerations)
      .where(eq(recurringGenerations.id, generation!.id));
    expect(marker).toHaveLength(1);
  });
});
