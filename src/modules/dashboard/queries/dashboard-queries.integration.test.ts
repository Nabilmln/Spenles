import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { accounts, categories, profiles, transactions } from "@/db/schema";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import { getTestDatabase } from "@/test/database";
import { resolveDashboardPeriods } from "../services/periods";
import {
  getCategoryExpenseAggregates,
  getMonthlyAggregates,
  getRecentDashboardTransactions,
  getSelectedAndPreviousTotals,
} from "./dashboard-queries";

const database = getTestDatabase();
const userA = `phase03-test-a-${randomUUID()}`;
const userB = `phase03-test-b-${randomUUID()}`;
const planUserA = `phase03-plan-a-${randomUUID()}`;
const planUserB = `phase03-plan-b-${randomUUID()}`;
const periods = resolveDashboardPeriods(
  {
    selection: { kind: "month", month: "2026-08" },
  },
  new Date("2026-08-05T10:00:00.000Z"),
);

let accountA = "";
let accountB = "";
let incomeCategoryA = "";
let expenseCategoryA = "";
let expenseCategoryA2 = "";
let incomeCategoryB = "";
let planAccountA = "";
let planAccountB = "";
let planExpenseCategoryA = "";
let planExpenseCategoryB = "";

beforeAll(async () => {
  await ensureUserFoundationWithDatabase(database, {
    id: userA,
    name: "Dashboard User A",
  });
  await ensureUserFoundationWithDatabase(database, {
    id: userB,
    name: "Dashboard User B",
  });
  await ensureUserFoundationWithDatabase(database, {
    id: planUserA,
    name: "Dashboard Plan User A",
  });
  await ensureUserFoundationWithDatabase(database, {
    id: planUserB,
    name: "Dashboard Plan User B",
  });

  const [ownedAccounts, ownedCategories] = await Promise.all([
    database
      .select({ id: accounts.id, userId: accounts.userId })
      .from(accounts)
      .where(inArray(accounts.userId, [userA, userB, planUserA, planUserB])),
    database
      .select({
        id: categories.id,
        userId: categories.userId,
        type: categories.type,
      })
      .from(categories)
      .where(
        inArray(categories.userId, [userA, userB, planUserA, planUserB]),
      ),
  ]);

  accountA = ownedAccounts.find((item) => item.userId === userA)!.id;
  accountB = ownedAccounts.find((item) => item.userId === userB)!.id;
  planAccountA = ownedAccounts.find(
    (item) => item.userId === planUserA,
  )!.id;
  planAccountB = ownedAccounts.find(
    (item) => item.userId === planUserB,
  )!.id;
  incomeCategoryA = ownedCategories.find(
    (item) => item.userId === userA && item.type === "income",
  )!.id;
  expenseCategoryA = ownedCategories.find(
    (item) => item.userId === userA && item.type === "expense",
  )!.id;
  incomeCategoryB = ownedCategories.find(
    (item) => item.userId === userB && item.type === "income",
  )!.id;
  planExpenseCategoryA = ownedCategories.find(
    (item) => item.userId === planUserA && item.type === "expense",
  )!.id;
  planExpenseCategoryB = ownedCategories.find(
    (item) => item.userId === planUserB && item.type === "expense",
  )!.id;

  const [extraCategory] = await database
    .insert(categories)
    .values({
      userId: userA,
      name: "Arsip Dashboard",
      normalizedName: "arsip dashboard",
      type: "expense",
      status: "archived",
    })
    .returning({ id: categories.id });
  expenseCategoryA2 = extraCategory.id;

  await database.insert(transactions).values([
    {
      userId: userA,
      accountId: accountA,
      categoryId: incomeCategoryA,
      type: "income",
      amount: 80n,
      transactionAt: new Date("2026-07-15T05:00:00.000Z"),
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 20n,
      transactionAt: new Date("2026-07-20T05:00:00.000Z"),
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: incomeCategoryA,
      type: "income",
      amount: 9_007_199_254_740_991n,
      transactionAt: new Date("2026-07-31T17:00:00.000Z"),
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: incomeCategoryA,
      type: "income",
      amount: 100n,
      transactionAt: new Date("2026-08-02T05:00:00.000Z"),
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA2,
      type: "expense",
      amount: 60n,
      transactionAt: new Date("2026-08-10T05:00:00.000Z"),
    },
    ...Array.from({ length: 6 }, (_, index) => ({
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense" as const,
      amount: BigInt(index + 1),
      transactionAt: new Date(
        `2026-08-${String(20 + index).padStart(2, "0")}T05:00:00.000Z`,
      ),
      note: `Recent ${index + 1}`,
    })),
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 500n,
      transactionAt: new Date("2026-08-12T05:00:00.000Z"),
      deletedAt: new Date("2026-08-13T05:00:00.000Z"),
    },
    {
      userId: userA,
      accountId: accountA,
      categoryId: expenseCategoryA,
      type: "expense",
      amount: 1_000n,
      transactionAt: new Date("2026-08-31T17:00:00.000Z"),
    },
    {
      userId: userB,
      accountId: accountB,
      categoryId: incomeCategoryB,
      type: "income",
      amount: 700n,
      transactionAt: new Date("2026-08-15T05:00:00.000Z"),
    },
  ]);

  await database.execute(sql`
    insert into transactions (
      user_id,
      account_id,
      category_id,
      type,
      amount,
      transaction_at
    )
    select
      ${planUserA},
      ${planAccountA}::uuid,
      ${planExpenseCategoryA}::uuid,
      'expense'::category_type,
      ((sequence % 1000) + 1)::bigint,
      timestamp with time zone '2023-01-01 00:00:00+00'
        + sequence * interval '6 hours'
    from generate_series(0, 5999) as sequence

    union all

    select
      ${planUserB},
      ${planAccountB}::uuid,
      ${planExpenseCategoryB}::uuid,
      'expense'::category_type,
      ((sequence % 1000) + 1)::bigint,
      timestamp with time zone '2023-01-01 00:00:00+00'
        + sequence * interval '6 hours'
    from generate_series(0, 5999) as sequence
  `);

  await database.execute(sql`analyze transactions`);
});

afterAll(async () => {
  await database
    .delete(profiles)
    .where(
      inArray(profiles.userId, [userA, userB, planUserA, planUserB]),
    );
  await database.execute(sql`analyze transactions`);
});

describe("Phase 03 dashboard queries", () => {
  it("returns exact selected and previous totals for only the owned active rows", async () => {
    const result = await getSelectedAndPreviousTotals(
      userA,
      periods.selected,
      periods.previous,
      database,
    );

    expect(result).toEqual({
      selected: {
        income: 9_007_199_254_741_091n,
        expense: 81n,
      },
      previous: { income: 80n, expense: 20n },
    });
  });

  it("groups the selected boundary instant into the Jakarta calendar month", async () => {
    const rows = await getMonthlyAggregates(
      userA,
      periods.selected,
      database,
    );

    expect(rows).toEqual([
      {
        period: "2026-08",
        income: 9_007_199_254_741_091n,
        expense: 81n,
      },
    ]);
  });

  it("retains an archived owned category in historical distribution", async () => {
    const rows = await getCategoryExpenseAggregates(
      userA,
      periods.selected,
      database,
    );

    expect(rows.reduce((sum, row) => sum + row.expense, 0n)).toBe(81n);
    expect(rows).toContainEqual(
      expect.objectContaining({
        categoryId: expenseCategoryA2,
        name: "Arsip Dashboard",
        expense: 60n,
      }),
    );
    expect(rows.every((row) => row.categoryId !== incomeCategoryB)).toBe(true);
  });

  it("returns five stable, owned, non-deleted recent transactions", async () => {
    const rows = await getRecentDashboardTransactions(
      userA,
      periods.selected,
      database,
    );

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.note)).toEqual([
      "Recent 6",
      "Recent 5",
      "Recent 4",
      "Recent 3",
      "Recent 2",
    ]);
    expect(rows.every((row) => row.amountIdr !== "500")).toBe(true);
  });

  it("returns no User A totals when queried with User B ownership", async () => {
    const result = await getSelectedAndPreviousTotals(
      userB,
      periods.selected,
      periods.previous,
      database,
    );

    expect(result.selected).toEqual({ income: 700n, expense: 0n });
    const categoriesForB = await database
      .select({ userId: categories.userId })
      .from(categories)
      .where(and(eq(categories.userId, userB), eq(categories.type, "expense")));
    expect(categoriesForB.length).toBeGreaterThan(0);
  });

  it("uses active transaction indexes for representative dashboard plans", async () => {
    type ExplainRow = { "QUERY PLAN": string };
    const start = new Date("2026-08-01T00:00:00.000Z");
    const end = new Date("2026-09-01T00:00:00.000Z");

    const plans = await Promise.all([
      database.execute<ExplainRow>(sql`
        explain (analyze, buffers, format text)
        select
          coalesce(sum(amount) filter (where type = 'income'), 0),
          coalesce(sum(amount) filter (where type = 'expense'), 0)
        from transactions
        where user_id = ${planUserA}
          and deleted_at is null
          and transaction_at >= ${start}
          and transaction_at < ${end}
      `),
      database.execute<ExplainRow>(sql`
        explain (analyze, buffers, format text)
        select
          date_trunc('month', timezone('Asia/Jakarta', transaction_at)),
          sum(amount)
        from transactions
        where user_id = ${planUserA}
          and deleted_at is null
          and transaction_at >= ${start}
          and transaction_at < ${end}
        group by date_trunc(
          'month',
          timezone('Asia/Jakarta', transaction_at)
        )
      `),
      database.execute<ExplainRow>(sql`
        explain (analyze, buffers, format text)
        select category_id, sum(amount)
        from transactions
        where user_id = ${planUserA}
          and deleted_at is null
          and type = 'expense'
          and transaction_at >= ${start}
          and transaction_at < ${end}
        group by category_id
      `),
      database.execute<ExplainRow>(sql`
        explain (analyze, buffers, format text)
        select id, transaction_at
        from transactions
        where user_id = ${planUserA}
          and deleted_at is null
          and transaction_at >= ${start}
          and transaction_at < ${end}
        order by transaction_at desc, id desc
        limit 5
      `),
    ]);

    const planTexts = plans.map((result) =>
      result.rows.map((row) => row["QUERY PLAN"]).join("\n"),
    );

    expect(planTexts).toHaveLength(4);
    for (const planText of planTexts) {
      expect(planText).toMatch(
        /transactions_user_(?:occurred_id|type_occurred)_active_idx/,
      );
      expect(planText).not.toMatch(/Seq Scan on transactions/);
    }
  });
});
