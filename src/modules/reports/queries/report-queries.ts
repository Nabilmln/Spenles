import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import { formatRangeLong } from "@/lib/dates/format-id";
import { calculateBudgetMetrics } from "@/modules/budgets/services/budget-metrics";
import { inclusiveDayCount } from "@/modules/reports/lib/report-date";
import { REPORT_DETAIL_LIMIT } from "../constants";
import type {
  ExportFilters,
  FinancialReport,
  ReportAccount,
  ReportBudget,
  ReportCategory,
  ReportFilters,
  ReportMonth,
  ReportTransaction,
} from "../types";
import { ExportLimitError } from "../services/csv";

type TotalsRow = { income: string; expense: string };
type MonthRow = { month: string; income: string; expense: string };
type DayRow = { day: string; income: string; expense: string };
type CategoryRow = { category_id: string; name: string; amount: string };
type TransactionRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  transaction_at: Date;
  note: string | null;
  created_at: Date;
  updated_at: Date;
  account_name: string;
  category_name: string;
};
type AccountRow = {
  account_id: string;
  name: string;
  type: string;
  opening_balance: string;
  income: string;
  expense: string;
  incoming_transfers: string;
  outgoing_transfers: string;
  closing_balance: string;
};
type BudgetRow = {
  category_name: string;
  amount: string;
  warning_threshold_bps: number;
  usage: string;
};

function transactionFilterSql(userId: string, filters: ExportFilters) {
  const conditions: SQL[] = [
    sql`owned_transaction.user_id = ${userId}`,
    sql`owned_transaction.deleted_at is null`,
    sql`owned_transaction.transaction_at >= ${filters.interval.start}`,
    sql`owned_transaction.transaction_at < ${filters.interval.end}`,
  ];
  if (filters.type) {
    conditions.push(sql`owned_transaction.type = ${filters.type}`);
  }
  if (filters.categoryId) {
    conditions.push(sql`owned_transaction.category_id = ${filters.categoryId}`);
  }
  if (filters.accountId) {
    conditions.push(sql`owned_transaction.account_id = ${filters.accountId}`);
  }
  if (filters.search) {
    const escaped = filters.search.replace(/[\\%_]/gu, "\\$&");
    conditions.push(sql`owned_transaction.note ilike ${`%${escaped}%`} escape '\\'`);
  }
  return sql.join(conditions, sql` and `);
}

export async function validateOwnedReportFilters(
  userId: string,
  filters: ExportFilters,
  database: Database = db,
) {
  const result = await database.execute<{ account_owned: boolean; category_owned: boolean }>(
    sql`
      select
        case
          when ${filters.accountId ?? null}::uuid is null then true
          else exists (
            select 1 from accounts
            where id = ${filters.accountId ?? null}::uuid
              and user_id = ${userId}
          )
        end as account_owned,
        case
          when ${filters.categoryId ?? null}::uuid is null then true
          else exists (
            select 1 from categories
            where id = ${filters.categoryId ?? null}::uuid
              and user_id = ${userId}
              and (
                ${filters.type ?? null}::text is null
                or type::text = ${filters.type ?? null}::text
              )
          )
        end as category_owned
    `,
  );
  const row = result.rows[0];
  return Boolean(row?.account_owned && row.category_owned);
}

async function getTotals(
  userId: string,
  filters: ReportFilters,
  database: Database,
) {
  const result = await database.execute<TotalsRow>(sql`
    select
      coalesce(sum(owned_transaction.amount)
        filter (where owned_transaction.type = 'income'), 0)::text as income,
      coalesce(sum(owned_transaction.amount)
        filter (where owned_transaction.type = 'expense'), 0)::text as expense
    from transactions as owned_transaction
    where ${transactionFilterSql(userId, filters)}
  `);
  const row = result.rows[0] ?? { income: "0", expense: "0" };
  const income = BigInt(row.income);
  const expense = BigInt(row.expense);
  return {
    incomeIdr: income.toString(),
    expenseIdr: expense.toString(),
    netIdr: (income - expense).toString(),
  };
}

async function getTransactionCount(
  userId: string,
  filters: ExportFilters,
  database: Database,
) {
  const result = await database.execute<{ count: string }>(sql`
    select count(*)::text as count
    from transactions as owned_transaction
    where ${transactionFilterSql(userId, filters)}
  `);
  return Number(result.rows[0]?.count ?? "0");
}

async function getMonths(
  userId: string,
  filters: ReportFilters,
  database: Database,
): Promise<ReportMonth[]> {
  const result = await database.execute<MonthRow>(sql`
    select
      to_char(
        date_trunc('month', timezone('Asia/Jakarta', owned_transaction.transaction_at)),
        'YYYY-MM'
      ) as month,
      coalesce(sum(owned_transaction.amount)
        filter (where owned_transaction.type = 'income'), 0)::text as income,
      coalesce(sum(owned_transaction.amount)
        filter (where owned_transaction.type = 'expense'), 0)::text as expense
    from transactions as owned_transaction
    where ${transactionFilterSql(userId, filters)}
    group by date_trunc(
      'month',
      timezone('Asia/Jakarta', owned_transaction.transaction_at)
    )
    order by date_trunc(
      'month',
      timezone('Asia/Jakarta', owned_transaction.transaction_at)
    )
  `);
  return result.rows.map((row) => ({
    month: row.month,
    incomeIdr: row.income,
    expenseIdr: row.expense,
  }));
}

async function getDays(
  userId: string,
  filters: ExportFilters,
  database: Database,
): Promise<DayRow[]> {
  const result = await database.execute<DayRow>(sql`
    select
      to_char(
        timezone('Asia/Jakarta', owned_transaction.transaction_at),
        'YYYY-MM-DD'
      ) as day,
      coalesce(sum(owned_transaction.amount)
        filter (where owned_transaction.type = 'income'), 0)::text as income,
      coalesce(sum(owned_transaction.amount)
        filter (where owned_transaction.type = 'expense'), 0)::text as expense
    from transactions as owned_transaction
    where ${transactionFilterSql(userId, filters)}
    group by to_char(
      timezone('Asia/Jakarta', owned_transaction.transaction_at),
      'YYYY-MM-DD'
    )
    order by to_char(
      timezone('Asia/Jakarta', owned_transaction.transaction_at),
      'YYYY-MM-DD'
    )
  `);
  return result.rows;
}

async function getCategories(
  userId: string,
  filters: ReportFilters,
  database: Database,
): Promise<ReportCategory[]> {
  const result = await database.execute<CategoryRow>(sql`
    select
      owned_category.id as category_id,
      owned_category.name,
      sum(owned_transaction.amount)::text as amount
    from transactions as owned_transaction
    inner join categories as owned_category
      on owned_category.id = owned_transaction.category_id
      and owned_category.user_id = ${userId}
    where ${transactionFilterSql(userId, {
      ...filters,
      type: filters.type ?? "expense",
    })}
    group by owned_category.id, owned_category.name, owned_category.normalized_name
    order by
      sum(owned_transaction.amount) desc,
      owned_category.normalized_name,
      owned_category.id
  `);
  return result.rows.map((row) => ({
    categoryId: row.category_id,
    name: row.name,
    amountIdr: row.amount,
  }));
}

async function getTransactions(
  userId: string,
  filters: ExportFilters,
  limit: number,
  database: Database,
): Promise<ReportTransaction[]> {
  const result = await database.execute<TransactionRow>(sql`
    select
      owned_transaction.id,
      owned_transaction.type,
      owned_transaction.amount::text as amount,
      owned_transaction.transaction_at,
      owned_transaction.note,
      owned_transaction.created_at,
      owned_transaction.updated_at,
      owned_account.name as account_name,
      owned_category.name as category_name
    from transactions as owned_transaction
    inner join accounts as owned_account
      on owned_account.id = owned_transaction.account_id
      and owned_account.user_id = ${userId}
    inner join categories as owned_category
      on owned_category.id = owned_transaction.category_id
      and owned_category.user_id = ${userId}
    where ${transactionFilterSql(userId, filters)}
    order by owned_transaction.transaction_at, owned_transaction.id
    limit ${limit}
  `);
  return result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    amountIdr: row.amount,
    transactionAt: new Date(row.transaction_at),
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    accountName: row.account_name,
    categoryName: row.category_name,
  }));
}

async function getAccounts(
  userId: string,
  filters: ReportFilters,
  database: Database,
): Promise<ReportAccount[]> {
  const result = await database.execute<AccountRow>(sql`
    select
      owned_account.id as account_id,
      owned_account.name,
      owned_account.type::text,
      (
        owned_account.opening_balance
        + coalesce((
          select sum(case when historical_transaction.type = 'income'
            then historical_transaction.amount else -historical_transaction.amount end)
          from transactions as historical_transaction
          where historical_transaction.user_id = ${userId}
            and historical_transaction.account_id = owned_account.id
            and historical_transaction.deleted_at is null
            and historical_transaction.transaction_at < ${filters.interval.start}
        ), 0)
        + coalesce((
          select sum(case
            when historical_transfer.destination_account_id = owned_account.id
              then historical_transfer.amount
            else -historical_transfer.amount end)
          from transfers as historical_transfer
          where historical_transfer.user_id = ${userId}
            and (
              historical_transfer.source_account_id = owned_account.id
              or historical_transfer.destination_account_id = owned_account.id
            )
            and historical_transfer.transferred_at < ${filters.interval.start}
        ), 0)
      )::text as opening_balance,
      coalesce((
        select sum(period_transaction.amount)
        from transactions as period_transaction
        where period_transaction.user_id = ${userId}
          and period_transaction.account_id = owned_account.id
          and period_transaction.deleted_at is null
          and period_transaction.type = 'income'
          and period_transaction.transaction_at >= ${filters.interval.start}
          and period_transaction.transaction_at < ${filters.interval.end}
          and (${filters.type ?? null}::text is null or ${filters.type ?? null}::text = 'income')
          and (${filters.categoryId ?? null}::uuid is null
            or period_transaction.category_id = ${filters.categoryId ?? null}::uuid)
      ), 0)::text as income,
      coalesce((
        select sum(period_transaction.amount)
        from transactions as period_transaction
        where period_transaction.user_id = ${userId}
          and period_transaction.account_id = owned_account.id
          and period_transaction.deleted_at is null
          and period_transaction.type = 'expense'
          and period_transaction.transaction_at >= ${filters.interval.start}
          and period_transaction.transaction_at < ${filters.interval.end}
          and (${filters.type ?? null}::text is null or ${filters.type ?? null}::text = 'expense')
          and (${filters.categoryId ?? null}::uuid is null
            or period_transaction.category_id = ${filters.categoryId ?? null}::uuid)
      ), 0)::text as expense,
      coalesce((
        select sum(period_transfer.amount)
        from transfers as period_transfer
        where period_transfer.user_id = ${userId}
          and period_transfer.destination_account_id = owned_account.id
          and period_transfer.transferred_at >= ${filters.interval.start}
          and period_transfer.transferred_at < ${filters.interval.end}
      ), 0)::text as incoming_transfers,
      coalesce((
        select sum(period_transfer.amount)
        from transfers as period_transfer
        where period_transfer.user_id = ${userId}
          and period_transfer.source_account_id = owned_account.id
          and period_transfer.transferred_at >= ${filters.interval.start}
          and period_transfer.transferred_at < ${filters.interval.end}
      ), 0)::text as outgoing_transfers,
      (
        owned_account.opening_balance
        + coalesce((
          select sum(case when closing_transaction.type = 'income'
            then closing_transaction.amount else -closing_transaction.amount end)
          from transactions as closing_transaction
          where closing_transaction.user_id = ${userId}
            and closing_transaction.account_id = owned_account.id
            and closing_transaction.deleted_at is null
            and closing_transaction.transaction_at < ${filters.interval.end}
        ), 0)
        + coalesce((
          select sum(case
            when closing_transfer.destination_account_id = owned_account.id
              then closing_transfer.amount
            else -closing_transfer.amount end)
          from transfers as closing_transfer
          where closing_transfer.user_id = ${userId}
            and (
              closing_transfer.source_account_id = owned_account.id
              or closing_transfer.destination_account_id = owned_account.id
            )
            and closing_transfer.transferred_at < ${filters.interval.end}
        ), 0)
      )::text as closing_balance
    from accounts as owned_account
    where owned_account.user_id = ${userId}
      and (${filters.accountId ?? null}::uuid is null
        or owned_account.id = ${filters.accountId ?? null}::uuid)
    order by lower(owned_account.name), owned_account.id
  `);
  return result.rows.map((row) => ({
    accountId: row.account_id,
    name: row.name,
    type: row.type,
    openingBalanceIdr: row.opening_balance,
    incomeIdr: row.income,
    expenseIdr: row.expense,
    incomingTransfersIdr: row.incoming_transfers,
    outgoingTransfersIdr: row.outgoing_transfers,
    closingBalanceIdr: row.closing_balance,
  }));
}

async function getBudgets(
  userId: string,
  filters: ReportFilters,
  database: Database,
): Promise<ReportBudget[]> {
  if (
    filters.interval.kind !== "month" ||
    filters.type ||
    filters.categoryId ||
    filters.accountId
  ) {
    return [];
  }
  const result = await database.execute<BudgetRow>(sql`
    select
      owned_category.name as category_name,
      owned_budget.amount::text,
      owned_budget.warning_threshold_bps,
      coalesce(sum(owned_transaction.amount), 0)::text as usage
    from budgets as owned_budget
    inner join categories as owned_category
      on owned_category.id = owned_budget.category_id
      and owned_category.user_id = ${userId}
    left join transactions as owned_transaction
      on owned_transaction.user_id = ${userId}
      and owned_transaction.category_id = owned_budget.category_id
      and owned_transaction.type = 'expense'
      and owned_transaction.deleted_at is null
      and owned_transaction.transaction_at >= ${filters.interval.start}
      and owned_transaction.transaction_at < ${filters.interval.end}
    where owned_budget.user_id = ${userId}
      and owned_budget.status = 'active'
      and owned_budget.budget_month = ${filters.interval.startDate}::date
    group by
      owned_budget.id,
      owned_category.name,
      owned_category.normalized_name
    order by owned_category.normalized_name, owned_budget.id
  `);
  return result.rows.map((row) => {
    const metrics = calculateBudgetMetrics(
      BigInt(row.amount),
      BigInt(row.usage),
      row.warning_threshold_bps,
    );
    return {
      categoryName: row.category_name,
      amountIdr: row.amount,
      usageIdr: row.usage,
      remainingIdr: metrics.remaining.toString(),
      percentageBps: metrics.percentageBps.toString(),
      status: metrics.status,
    };
  });
}

export async function getFinancialReport(
  userId: string,
  displayName: string,
  filters: ReportFilters,
  database: Database = db,
  generatedAt = new Date(),
): Promise<FinancialReport> {
  const [
    summary,
    months,
    categories,
    accounts,
    budgets,
    detailRows,
    transactionCount,
  ] = await Promise.all([
    getTotals(userId, filters, database),
    getMonths(userId, filters, database),
    getCategories(userId, filters, database),
    getAccounts(userId, filters, database),
    getBudgets(userId, filters, database),
    filters.includeDetails
      ? getTransactions(userId, filters, REPORT_DETAIL_LIMIT + 1, database)
      : Promise.resolve([]),
    getTransactionCount(userId, filters, database),
  ]);

  if (detailRows.length > REPORT_DETAIL_LIMIT) {
    throw new ExportLimitError(
      `Detail laporan melebihi batas ${REPORT_DETAIL_LIMIT} transaksi.`,
    );
  }
  return {
    displayName,
    generatedAt,
    filters,
    summary,
    months,
    categories,
    accounts,
    budgets,
    transactions: detailRows,
    transactionCount,
  };
}

export async function listCsvTransactions(
  userId: string,
  filters: ExportFilters,
  limit: number,
  database: Database = db,
) {
  return getTransactions(userId, filters, limit, database);
}

function customInterval(from: string, to: string) {
  const start = new Date(`${from}T00:00:00+07:00`);
  const inclusiveEnd = new Date(`${to}T00:00:00+07:00`);
  return {
    interval: {
      kind: "custom" as const,
      label: formatRangeLong(from, to),
      filePart: `${from}-to-${to}`,
      startDate: from,
      endDate: to,
      start,
      end: new Date(inclusiveEnd.getTime() + 86_400_000),
    },
  };
}

export async function getReportAnalysis(
  userId: string,
  from: string,
  to: string,
  database: Database = db,
) {
  const { interval } = customInterval(from, to);
  const filters: ReportFilters = { interval, includeDetails: false };
  const inclusiveDays = inclusiveDayCount(from, to);
  const daily = inclusiveDays > 0 && inclusiveDays <= 62;
  const [summary, months, categories, dayRows] = await Promise.all([
    getTotals(userId, filters, database),
    daily ? Promise.resolve([]) : getMonths(userId, filters, database),
    getCategories(userId, filters, database),
    daily ? getDays(userId, filters, database) : Promise.resolve([]),
  ]);
  const expense = BigInt(summary.expenseIdr);
  const averageDailyExpenseIdr =
    inclusiveDays > 0 ? (expense / BigInt(inclusiveDays)).toString() : "0";
  const series = daily
    ? dayRows.map((row) => ({
        month: row.day,
        incomeIdr: row.income,
        expenseIdr: row.expense,
      }))
    : months;
  return {
    summary,
    months,
    categories,
    daily,
    series,
    insight: { inclusiveDays, averageDailyExpenseIdr },
  };
}

export async function listCategoryTransactions(
  userId: string,
  categoryId: string,
  from: string,
  to: string,
  limit: number,
  database: Database = db,
) {
  const { interval } = customInterval(from, to);
  const filters: ExportFilters = { interval, categoryId };
  return getTransactions(userId, filters, limit, database);
}

export async function getReportCategoryBreakdown(
  userId: string,
  from: string,
  to: string,
  type: "income" | "expense",
  database: Database = db,
) {
  const { interval } = customInterval(from, to);
  const filters: ReportFilters = {
    interval,
    type,
    includeDetails: false,
  };
  const [categories, summary] = await Promise.all([
    getCategories(userId, filters, database),
    getTotals(userId, filters, database),
  ]);
  const total = BigInt(summary[type === "income" ? "incomeIdr" : "expenseIdr"]);
  return {
    type,
    totalIdr: total.toString(),
    categories: categories.map((category) => {
      const amount = BigInt(category.amountIdr);
      const shareBps =
        total === 0n ? 0 : Number((amount * 10_000n) / total);
      return { ...category, shareBps };
    }),
  };
}
