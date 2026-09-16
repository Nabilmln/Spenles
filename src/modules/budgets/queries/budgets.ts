import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import {
  addCalendarDays,
  daysInMonth,
  todayJakartaDate,
} from "@/lib/dates/calendar";
import {
  calculateBudgetMetrics,
  type BudgetStatus,
} from "../services/budget-metrics";

export type BudgetPeriodType = "monthly" | "weekly" | "custom";

type RawBudget = {
  id: string;
  category_id: string;
  category_name: string;
  category_icon: string | null;
  period_type: BudgetPeriodType;
  period_start: string | null;
  period_end: string | null;
  amount: string;
  warning_threshold_bps: number | null;
  warning_days_remaining: number | null;
  status: "active" | "archived";
  usage: string;
};

export type BudgetListRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  periodType: BudgetPeriodType;
  periodStart: string | null;
  periodEnd: string | null;
  amount: string;
  warningThresholdBps: number | null;
  warningDaysRemaining: number | null;
  recordStatus: "active" | "archived";
  usage: string;
  remaining: string;
  percentageBps: string;
  budgetStatus: BudgetStatus;
  daysRemainingInPeriod: number | null;
};

type PeriodWindows = {
  monthStart: string;
  monthEndExclusive: string;
  weekStart: string;
  weekEndExclusive: string;
};

function currentMonthWindow(today: string): { start: string; end: string } {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

function currentWeekWindow(today: string): { start: string; end: string } {
  const weekday = new Date(
    Date.UTC(
      Number(today.slice(0, 4)),
      Number(today.slice(5, 7)) - 1,
      Number(today.slice(8, 10)),
    ),
  ).getUTCDay();
  const mondayIndex = (weekday + 6) % 7;
  return {
    start: addCalendarDays(today, -mondayIndex)!,
    end: addCalendarDays(today, 7 - mondayIndex)!,
  };
}

function computeWindows(today: string): PeriodWindows {
  const month = currentMonthWindow(today);
  const week = currentWeekWindow(today);
  return {
    monthStart: month.start,
    monthEndExclusive: month.end,
    weekStart: week.start,
    weekEndExclusive: week.end,
  };
}

function calendarDaysBetween(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  return Math.round(
    (Date.UTC(toYear, toMonth - 1, toDay) -
      Date.UTC(fromYear, fromMonth - 1, fromDay)) /
      86_400_000,
  );
}

function daysRemainingInPeriod(row: RawBudget, today: string): number {
  if (row.period_type === "monthly") {
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    return daysInMonth(year, month) - Number(today.slice(8, 10));
  }
  if (row.period_type === "weekly") {
    const weekday = new Date(
      Date.UTC(
        Number(today.slice(0, 4)),
        Number(today.slice(5, 7)) - 1,
        Number(today.slice(8, 10)),
      ),
    ).getUTCDay();
    return 6 - ((weekday + 6) % 7);
  }
  return row.period_end ? calendarDaysBetween(today, row.period_end) : 0;
}

function mapBudget(row: RawBudget, today: string): BudgetListRow {
  const warning =
    row.warning_threshold_bps !== null
      ? { type: "threshold" as const, thresholdBps: row.warning_threshold_bps }
      : { type: "days" as const, daysRemaining: row.warning_days_remaining ?? 0 };
  const metrics = calculateBudgetMetrics({
    amount: BigInt(row.amount),
    usage: BigInt(row.usage),
    warning,
    daysRemainingInPeriod: daysRemainingInPeriod(row, today),
  });
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryIcon: row.category_icon,
    periodType: row.period_type,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    amount: row.amount,
    warningThresholdBps: row.warning_threshold_bps,
    warningDaysRemaining: row.warning_days_remaining,
    recordStatus: row.status,
    usage: metrics.usage.toString(),
    remaining: metrics.remaining.toString(),
    percentageBps: metrics.percentageBps.toString(),
    budgetStatus: metrics.status,
    daysRemainingInPeriod: daysRemainingInPeriod(row, today),
  };
}

export async function listOwnedBudgets(
  userId: string,
  database: Database = db,
) {
  const today = todayJakartaDate();
  const windows = computeWindows(today);
  const result = await database.execute<RawBudget>(sql`
    select
      budget.id,
      budget.category_id,
      category.name as category_name,
      category.icon as category_icon,
      budget.period_type,
      budget.period_start::text,
      budget.period_end::text,
      budget.amount::text,
      budget.warning_threshold_bps,
      budget.warning_days_remaining,
      budget.status,
      coalesce((
        select sum(transaction.amount)
        from transactions as transaction
        where transaction.user_id = ${userId}
          and transaction.category_id = budget.category_id
          and transaction.type = 'expense'
          and transaction.deleted_at is null
          and (
            (budget.period_type = 'monthly'
              and transaction.transaction_at >= ${windows.monthStart}::timestamp at time zone 'Asia/Jakarta'
              and transaction.transaction_at < ${windows.monthEndExclusive}::timestamp at time zone 'Asia/Jakarta')
            or (budget.period_type = 'weekly'
              and transaction.transaction_at >= ${windows.weekStart}::timestamp at time zone 'Asia/Jakarta'
              and transaction.transaction_at < ${windows.weekEndExclusive}::timestamp at time zone 'Asia/Jakarta')
            or (budget.period_type = 'custom'
              and transaction.transaction_at >= (budget.period_start::timestamp at time zone 'Asia/Jakarta')
              and transaction.transaction_at < ((budget.period_end + interval '1 day')::timestamp at time zone 'Asia/Jakarta'))
          )
      ), 0)::text as usage
    from budgets as budget
    inner join categories as category
      on category.id = budget.category_id
      and category.user_id = ${userId}
    where budget.user_id = ${userId}
    order by
      case when budget.status = 'active' then 0 else 1 end,
      case budget.period_type when 'monthly' then 0 when 'weekly' then 1 else 2 end,
      lower(category.name),
      budget.id
  `);
  return result.rows.map((row) => mapBudget(row, today));
}

export async function getOwnedBudget(
  userId: string,
  budgetId: string,
  database: Database = db,
) {
  const today = todayJakartaDate();
  const windows = computeWindows(today);
  const result = await database.execute<RawBudget>(sql`
    select
      budget.id,
      budget.category_id,
      category.name as category_name,
      category.icon as category_icon,
      budget.period_type,
      budget.period_start::text,
      budget.period_end::text,
      budget.amount::text,
      budget.warning_threshold_bps,
      budget.warning_days_remaining,
      budget.status,
      coalesce((
        select sum(transaction.amount)
        from transactions as transaction
        where transaction.user_id = ${userId}
          and transaction.category_id = budget.category_id
          and transaction.type = 'expense'
          and transaction.deleted_at is null
          and (
            (budget.period_type = 'monthly'
              and transaction.transaction_at >= ${windows.monthStart}::timestamp at time zone 'Asia/Jakarta'
              and transaction.transaction_at < ${windows.monthEndExclusive}::timestamp at time zone 'Asia/Jakarta')
            or (budget.period_type = 'weekly'
              and transaction.transaction_at >= ${windows.weekStart}::timestamp at time zone 'Asia/Jakarta'
              and transaction.transaction_at < ${windows.weekEndExclusive}::timestamp at time zone 'Asia/Jakarta')
            or (budget.period_type = 'custom'
              and transaction.transaction_at >= (budget.period_start::timestamp at time zone 'Asia/Jakarta')
              and transaction.transaction_at < ((budget.period_end + interval '1 day')::timestamp at time zone 'Asia/Jakarta'))
          )
      ), 0)::text as usage
    from budgets as budget
    inner join categories as category
      on category.id = budget.category_id
      and category.user_id = ${userId}
    where budget.user_id = ${userId}
      and budget.id = ${budgetId}
    limit 1
  `);
  const row = result.rows[0];
  return row ? mapBudget(row, today) : null;
}

export async function listActiveExpenseCategoryOptions(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<{ id: string; name: string; icon: string | null }>(sql`
    select id, name, icon
    from categories
    where user_id = ${userId}
      and type = 'expense'
      and status = 'active'
    order by lower(name), id
  `);
  return result.rows;
}