import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import type {
  CategoryAggregate,
  DailyExpenseAggregate,
  DateInterval,
  MonthlyAggregate,
  RecentDashboardTransaction,
} from "../types/dashboard";

type TotalsRow = {
  selected_income: string;
  selected_expense: string;
  previous_income: string;
  previous_expense: string;
};

type MonthlyRow = {
  period: string;
  income: string;
  expense: string;
};

type CategoryRow = {
  category_id: string;
  name: string;
  normalized_name: string;
  color: string | null;
  icon: string | null;
  expense: string;
};

type RecentRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  transaction_at: Date;
  note: string | null;
  account_name: string;
  category_name: string;
};

export async function getSelectedAndPreviousTotals(
  authenticatedUserId: string,
  selected: DateInterval,
  previous: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<TotalsRow>(sql`
    select
      coalesce(
        sum(amount) filter (
          where type = 'income'
            and transaction_at >= ${selected.start}
            and transaction_at < ${selected.end}
        ),
        0
      )::text as selected_income,
      coalesce(
        sum(amount) filter (
          where type = 'expense'
            and transaction_at >= ${selected.start}
            and transaction_at < ${selected.end}
        ),
        0
      )::text as selected_expense,
      coalesce(
        sum(amount) filter (
          where type = 'income'
            and transaction_at >= ${previous.start}
            and transaction_at < ${previous.end}
        ),
        0
      )::text as previous_income,
      coalesce(
        sum(amount) filter (
          where type = 'expense'
            and transaction_at >= ${previous.start}
            and transaction_at < ${previous.end}
        ),
        0
      )::text as previous_expense
    from transactions
    where user_id = ${authenticatedUserId}
      and deleted_at is null
      and transaction_at >= ${previous.start}
      and transaction_at < ${selected.end}
  `);

  const row = result.rows[0];
  if (!row) throw new Error("Dashboard totals query returned no row.");

  return {
    selected: {
      income: BigInt(row.selected_income),
      expense: BigInt(row.selected_expense),
    },
    previous: {
      income: BigInt(row.previous_income),
      expense: BigInt(row.previous_expense),
    },
  };
}

export async function getMonthlyAggregates(
  authenticatedUserId: string,
  interval: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<MonthlyRow>(sql`
    select
      to_char(
        date_trunc('month', timezone('Asia/Jakarta', transaction_at)),
        'YYYY-MM'
      ) as period,
      coalesce(sum(amount) filter (where type = 'income'), 0)::text as income,
      coalesce(sum(amount) filter (where type = 'expense'), 0)::text as expense
    from transactions
    where user_id = ${authenticatedUserId}
      and deleted_at is null
      and transaction_at >= ${interval.start}
      and transaction_at < ${interval.end}
    group by date_trunc(
      'month',
      timezone('Asia/Jakarta', transaction_at)
    )
    order by date_trunc(
      'month',
      timezone('Asia/Jakarta', transaction_at)
    )
  `);

  return result.rows.map(
    (row): MonthlyAggregate => ({
      period: row.period,
      income: BigInt(row.income),
      expense: BigInt(row.expense),
    }),
  );
}

export async function getCategoryExpenseAggregates(
  authenticatedUserId: string,
  interval: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<CategoryRow>(sql`
    select
      owned_category.id as category_id,
      owned_category.name,
      owned_category.normalized_name,
      owned_category.color,
      owned_category.icon,
      sum(owned_transaction.amount)::text as expense
    from transactions as owned_transaction
    inner join categories as owned_category
      on owned_category.id = owned_transaction.category_id
      and owned_category.user_id = ${authenticatedUserId}
    where owned_transaction.user_id = ${authenticatedUserId}
      and owned_transaction.deleted_at is null
      and owned_transaction.type = 'expense'
      and owned_transaction.transaction_at >= ${interval.start}
      and owned_transaction.transaction_at < ${interval.end}
    group by
      owned_category.id,
      owned_category.name,
      owned_category.normalized_name,
      owned_category.color,
      owned_category.icon
    order by
      sum(owned_transaction.amount) desc,
      owned_category.normalized_name asc,
      owned_category.id asc
  `);

  return result.rows.map(
    (row): CategoryAggregate => ({
      categoryId: row.category_id,
      name: row.name,
      normalizedName: row.normalized_name,
      color: row.color,
      icon: row.icon,
      expense: BigInt(row.expense),
    }),
  );
}

export async function getRecentDashboardTransactions(
  authenticatedUserId: string,
  interval: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<RecentRow>(sql`
    select
      owned_transaction.id,
      owned_transaction.type,
      owned_transaction.amount::text as amount,
      owned_transaction.transaction_at,
      owned_transaction.note,
      owned_account.name as account_name,
      owned_category.name as category_name
    from transactions as owned_transaction
    inner join accounts as owned_account
      on owned_account.id = owned_transaction.account_id
      and owned_account.user_id = ${authenticatedUserId}
    inner join categories as owned_category
      on owned_category.id = owned_transaction.category_id
      and owned_category.user_id = ${authenticatedUserId}
    where owned_transaction.user_id = ${authenticatedUserId}
      and owned_transaction.deleted_at is null
      and owned_transaction.transaction_at >= ${interval.start}
      and owned_transaction.transaction_at < ${interval.end}
    order by
      owned_transaction.transaction_at desc,
      owned_transaction.id desc
    limit 5
  `);

  return result.rows.map(
    (row): RecentDashboardTransaction => ({
      id: row.id,
      type: row.type,
      amountIdr: row.amount,
      transactionAt: new Date(row.transaction_at),
      note: row.note,
      accountName: row.account_name,
      categoryName: row.category_name,
    }),
  );
}

type DailyRow = { day: string; expense: string };

export async function getDailyExpenseAggregates(
  authenticatedUserId: string,
  interval: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<DailyRow>(sql`
    select
      to_char(
        timezone('Asia/Jakarta', transaction_at),
        'YYYY-MM-DD'
      ) as day,
      coalesce(sum(amount), 0)::text as expense
    from transactions
    where user_id = ${authenticatedUserId}
      and deleted_at is null
      and type = 'expense'
      and transaction_at >= ${interval.start}
      and transaction_at < ${interval.end}
    group by to_char(
      timezone('Asia/Jakarta', transaction_at),
      'YYYY-MM-DD'
    )
    order by to_char(
      timezone('Asia/Jakarta', transaction_at),
      'YYYY-MM-DD'
    )
  `);

  return result.rows.map(
    (row): DailyExpenseAggregate => ({
      day: row.day,
      expense: BigInt(row.expense),
    }),
  );
}

type IncomeExpensePeriodRow = {
  period: string;
  income: string;
  expense: string;
};

export async function getDailyIncomeExpenseAggregates(
  authenticatedUserId: string,
  interval: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<IncomeExpensePeriodRow>(sql`
    select
      to_char(
        timezone('Asia/Jakarta', transaction_at),
        'YYYY-MM-DD'
      ) as period,
      coalesce(
        sum(amount) filter (where type = 'income'),
        0
      )::text as income,
      coalesce(
        sum(amount) filter (where type = 'expense'),
        0
      )::text as expense
    from transactions
    where user_id = ${authenticatedUserId}
      and deleted_at is null
      and transaction_at >= ${interval.start}
      and transaction_at < ${interval.end}
    group by to_char(
      timezone('Asia/Jakarta', transaction_at),
      'YYYY-MM-DD'
    )
    order by to_char(
      timezone('Asia/Jakarta', transaction_at),
      'YYYY-MM-DD'
    )
  `);

  return result.rows.map((row) => ({
    period: row.period,
    income: BigInt(row.income),
    expense: BigInt(row.expense),
  }));
}

export async function getWeeklyIncomeExpenseAggregates(
  authenticatedUserId: string,
  interval: DateInterval,
  database: Database = db,
) {
  const result = await database.execute<IncomeExpensePeriodRow>(sql`
    select
      to_char(
        date_trunc('week', timezone('Asia/Jakarta', transaction_at)),
        'YYYY-MM-DD'
      ) as period,
      coalesce(
        sum(amount) filter (where type = 'income'),
        0
      )::text as income,
      coalesce(
        sum(amount) filter (where type = 'expense'),
        0
      )::text as expense
    from transactions
    where user_id = ${authenticatedUserId}
      and deleted_at is null
      and transaction_at >= ${interval.start}
      and transaction_at < ${interval.end}
    group by date_trunc(
      'week',
      timezone('Asia/Jakarta', transaction_at)
    )
    order by date_trunc(
      'week',
      timezone('Asia/Jakarta', transaction_at)
    )
  `);

  return result.rows.map((row) => ({
    period: row.period,
    income: BigInt(row.income),
    expense: BigInt(row.expense),
  }));
}

export async function getRecentActivityTransactions(
  authenticatedUserId: string,
  database: Database = db,
) {
  const result = await database.execute<RecentRow>(sql`
    select
      owned_transaction.id,
      owned_transaction.type,
      owned_transaction.amount::text as amount,
      owned_transaction.transaction_at,
      owned_transaction.note,
      owned_account.name as account_name,
      owned_category.name as category_name
    from transactions as owned_transaction
    inner join accounts as owned_account
      on owned_account.id = owned_transaction.account_id
      and owned_account.user_id = ${authenticatedUserId}
    inner join categories as owned_category
      on owned_category.id = owned_transaction.category_id
      and owned_category.user_id = ${authenticatedUserId}
    where owned_transaction.user_id = ${authenticatedUserId}
      and owned_transaction.deleted_at is null
    order by
      owned_transaction.transaction_at desc,
      owned_transaction.id desc
    limit 5
  `);

  return result.rows.map(
    (row): RecentDashboardTransaction => ({
      id: row.id,
      type: row.type,
      amountIdr: row.amount,
      transactionAt: new Date(row.transaction_at),
      note: row.note,
      accountName: row.account_name,
      categoryName: row.category_name,
    }),
  );
}
