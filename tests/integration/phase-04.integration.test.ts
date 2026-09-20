import { randomUUID } from "node:crypto";
import { eq, inArray, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  categories,
  profiles,
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
  getPeriodSavings,
  listOwnedAccounts,
} from "@/modules/accounts/queries/accounts";
import {
  createOwnedBudget,
  setOwnedBudgetStatus,
} from "@/modules/budgets/services/budget-mutations";
import { listOwnedBudgets, getOwnedBudget } from "@/modules/budgets/queries/budgets";
import { createOwnedTransaction, softDeleteOwnedTransaction } from "@/modules/transactions/services/transaction-mutations";
import { todayJakartaDate } from "@/lib/dates/calendar";
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
  let foreignExpenseCategory: string;

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

    const foreignCategories = await database
      .select({ id: categories.id, type: categories.type })
      .from(categories)
      .where(eq(categories.userId, userB));
    foreignExpenseCategory = foreignCategories.find(
      (item) => item.type === "expense",
    )!.id;
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

    const periodEnums = await database.execute<{ enumlabel: string }>(sql`
      select enumlabel
      from pg_enum
      inner join pg_type on pg_type.oid = pg_enum.enumtypid
      where pg_type.typname = 'budget_period_type'
      order by pg_enum.enumsortorder
    `);
    expect(periodEnums.rows.map((row) => row.enumlabel)).toEqual([
      "monthly",
      "weekly",
      "custom",
    ]);

    const indexes = await database.execute<{ indexname: string }>(sql`
      select indexname
      from pg_indexes
      where schemaname = 'public'
        and indexname in (
          'budgets_user_category_active_uidx',
          'transfers_reversal_of_uidx'
        )
    `);
    expect(indexes.rows.map((row) => row.indexname).sort()).toEqual([
      "budgets_user_category_active_uidx",
      "transfers_reversal_of_uidx",
    ]);

    const constraints = await database.execute<{ conname: string }>(sql`
      select conname
      from pg_constraint
      where conname in (
        'accounts_opening_balance_safe',
        'budgets_category_owner_fk',
        'budgets_warning_mode_exclusive',
        'budgets_warning_threshold_valid',
        'budgets_warning_days_valid',
        'budgets_period_dates_valid',
        'transfers_source_account_owner_fk',
        'transfers_destination_account_owner_fk'
      )
    `);
    expect(constraints.rows.map((row) => row.conname).sort()).toEqual([
      "accounts_opening_balance_safe",
      "budgets_category_owner_fk",
      "budgets_period_dates_valid",
      "budgets_warning_days_valid",
      "budgets_warning_mode_exclusive",
      "budgets_warning_threshold_valid",
      "transfers_destination_account_owner_fk",
      "transfers_source_account_owner_fk",
    ]);
  });

  afterAll(async () => {
    await database
      .delete(profiles)
      .where(inArray(profiles.userId, [userA, userB]));
  });

  async function archiveActiveBudget(userId: string, categoryId: string) {
    const rows = await listOwnedBudgets(userId, database);
    const active = rows.find(
      (row) => row.categoryId === categoryId && row.recordStatus === "active",
    );
    if (active) {
      await setOwnedBudgetStatus(database, userId, active.id, "archived");
    }
  }

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
    await archiveActiveBudget(userA, expenseCategory);
    const today = todayJakartaDate();
    const first = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      periodType: "monthly",
      periodStart: null,
      periodEnd: null,
      amount: 100_000n,
      warningThresholdBps: 8000,
      warningDaysRemaining: null,
    });
    const duplicate = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      periodType: "weekly",
      periodStart: null,
      periodEnd: null,
      amount: 200_000n,
      warningThresholdBps: 8000,
      warningDaysRemaining: null,
    });
    expect(first.ok).toBe(true);
    expect(duplicate).toEqual({ ok: false, reason: "duplicate" });

    const transactionAt = new Date(`${today}T12:00:00+07:00`);
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
    await archiveActiveBudget(userA, expenseCategory);
    const archived = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      periodType: "monthly",
      periodStart: null,
      periodEnd: null,
      amount: 1n,
      warningThresholdBps: 8000,
      warningDaysRemaining: null,
    });
    expect(archived.ok).toBe(true);
    await setOwnedBudgetStatus(
      database,
      userA,
      archived.ok ? archived.id : "",
      "archived",
    );
    const active = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      periodType: "monthly",
      periodStart: null,
      periodEnd: null,
      amount: 2n,
      warningThresholdBps: 8000,
      warningDaysRemaining: null,
    });
    expect(active.ok).toBe(true);
    await expect(
      setOwnedBudgetStatus(
        database,
        userA,
        archived.ok ? archived.id : "",
        "active",
      ),
    ).resolves.toEqual({ ok: false, reason: "duplicate" });
  });

  it("returns only the requested budget owned by the user", async () => {
    await archiveActiveBudget(userA, expenseCategory);
    const owned = await createOwnedBudget(database, userA, {
      categoryId: expenseCategory,
      periodType: "monthly",
      periodStart: null,
      periodEnd: null,
      amount: 150_000n,
      warningThresholdBps: 8000,
      warningDaysRemaining: null,
    });
    expect(owned.ok).toBe(true);

    const own = await getOwnedBudget(userA, owned.ok ? owned.id : "", database);
    expect(own?.id).toBe(owned.ok ? owned.id : "");
    expect(own?.amount).toBe("150000");
    expect(own?.periodType).toBe("monthly");

    const foreign = await createOwnedBudget(database, userB, {
      categoryId: foreignExpenseCategory,
      periodType: "monthly",
      periodStart: null,
      periodEnd: null,
      amount: 99_000n,
      warningThresholdBps: 8000,
      warningDaysRemaining: null,
    });
    expect(foreign.ok).toBe(true);

    const crossRead = await getOwnedBudget(
      userA,
      foreign.ok ? foreign.id : "",
      database,
    );
    expect(crossRead).toBeNull();

    const reverse = await getOwnedBudget(
      userB,
      owned.ok ? owned.id : "",
      database,
    );
    expect(reverse).toBeNull();

    expect(getOwnedBudget(userA, "00000000-0000-4000-8000-000000000000", database))
      .resolves.toBeNull();
  });

  it("aggregates net savings from transfers into savings-designated accounts", async () => {
    const savingsAccount = (
      await createOwnedAccount(database, userA, {
        name: "Tabungan uji",
        type: "savings",
        openingBalance: 0n,
      })
    )!.id;
    const interval = {
      start: new Date("2026-08-01T00:00:00Z"),
      end: new Date("2026-09-01T00:00:00Z"),
    };
    const before = await getPeriodSavings(userA, interval.start, interval.end, database);
    expect(before).toEqual({ savedIn: 0n, savedOut: 0n, net: 0n });

    await createOwnedTransfer(database, userA, {
      sourceAccountId: accountA,
      destinationAccountId: savingsAccount,
      amount: 300_000n,
      transferredAt: new Date("2026-08-10T00:00:00Z"),
      note: "Menabung",
    });
    const saved = await getPeriodSavings(userA, interval.start, interval.end, database);
    expect(saved).toEqual({ savedIn: 300_000n, savedOut: 0n, net: 300_000n });

    await createOwnedTransfer(database, userA, {
      sourceAccountId: savingsAccount,
      destinationAccountId: accountA,
      amount: 50_000n,
      transferredAt: new Date("2026-08-11T00:00:00Z"),
      note: "Tarik dana",
    });
    const withdrawn = await getPeriodSavings(userA, interval.start, interval.end, database);
    expect(withdrawn).toEqual({ savedIn: 300_000n, savedOut: 50_000n, net: 250_000n });

    const reversed = await createOwnedTransfer(database, userA, {
      sourceAccountId: accountA,
      destinationAccountId: savingsAccount,
      amount: 20_000n,
      transferredAt: new Date("2026-08-12T00:00:00Z"),
      note: "Dibatalkan",
    });
    await reverseOwnedTransfer(database, userA, reversed!.id);
    const afterReversal = await getPeriodSavings(userA, interval.start, interval.end, database);
    expect(afterReversal).toEqual({ savedIn: 300_000n, savedOut: 50_000n, net: 250_000n });

    const savingsBalance = await getOwnedAccount(userA, savingsAccount, database);
    expect(savingsBalance?.balance).toBe("250000");
  });
});
