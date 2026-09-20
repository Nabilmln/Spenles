import "server-only";

import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import { conditionalSumSql } from "@/db/sql-helpers";
import { formatRangeLong } from "@/lib/dates/format-id";
import { inclusiveDayCount } from "@/modules/reports/lib/report-date";
import { REPORT_DETAIL_LIMIT } from "../constants";
import type {
  ExportFilters,
  FinancialReport,
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
      ${conditionalSumSql(
        sql`owned_transaction.amount`,
        sql`owned_transaction.type = 'income'`,
      )} as income,
      ${conditionalSumSql(
        sql`owned_transaction.amount`,
        sql`owned_transaction.type = 'expense'`,
      )} as expense
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
      ${conditionalSumSql(
        sql`owned_transaction.amount`,
        sql`owned_transaction.type = 'income'`,
      )} as income,
      ${conditionalSumSql(
        sql`owned_transaction.amount`,
        sql`owned_transaction.type = 'expense'`,
      )} as expense
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
      ${conditionalSumSql(
        sql`owned_transaction.amount`,
        sql`owned_transaction.type = 'income'`,
      )} as income,
      ${conditionalSumSql(
        sql`owned_transaction.amount`,
        sql`owned_transaction.type = 'expense'`,
      )} as expense
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

export async function getFinancialReport(
  userId: string,
  displayName: string,
  filters: ReportFilters,
  database: Database = db,
  generatedAt = new Date(),
): Promise<FinancialReport> {
  const [summary, categories, detailRows, transactionCount] = await Promise.all([
    getTotals(userId, filters, database),
    getCategories(userId, filters, database),
    filters.includeDetails
      ? getTransactions(userId, filters, REPORT_DETAIL_LIMIT + 1, database)
      : Promise.resolve([]),
    getTransactionCount(userId, filters, database),
  ]);

  if (detailRows.length > REPORT_DETAIL_LIMIT) {
    throw new ExportLimitError(
      `Report details exceed the ${REPORT_DETAIL_LIMIT}-transaction limit.`,
    );
  }
  return {
    displayName,
    generatedAt,
    filters,
    summary,
    categories,
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
  const [summary, months, dayRows] = await Promise.all([
    getTotals(userId, filters, database),
    daily ? Promise.resolve([]) : getMonths(userId, filters, database),
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
  totalIdr?: string,
  database: Database = db,
) {
  const { interval } = customInterval(from, to);
  const filters: ReportFilters = {
    interval,
    type,
    includeDetails: false,
  };
  const categories = await getCategories(userId, filters, database);
  const total =
    totalIdr !== undefined
      ? BigInt(totalIdr)
      : BigInt(
          (
            await getTotals(userId, filters, database)
          )[type === "income" ? "incomeIdr" : "expenseIdr"],
        );
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
