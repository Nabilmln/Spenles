import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import {
  calculateBudgetMetrics,
  type BudgetStatus,
} from "../services/budget-metrics";

type RawBudget = {
  id: string;
  category_id: string;
  category_name: string;
  budget_month: string;
  amount: string;
  warning_threshold_bps: number;
  status: "active" | "archived";
  usage: string;
};

export type BudgetListRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  month: string;
  amount: string;
  warningThresholdBps: number;
  recordStatus: "active" | "archived";
  usage: string;
  remaining: string;
  percentageBps: string;
  budgetStatus: BudgetStatus;
};

function mapBudget(row: RawBudget): BudgetListRow {
  const metrics = calculateBudgetMetrics(
    BigInt(row.amount),
    BigInt(row.usage),
    row.warning_threshold_bps,
  );
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    month: row.budget_month.slice(0, 7),
    amount: row.amount,
    warningThresholdBps: row.warning_threshold_bps,
    recordStatus: row.status,
    usage: metrics.usage.toString(),
    remaining: metrics.remaining.toString(),
    percentageBps: metrics.percentageBps.toString(),
    budgetStatus: metrics.status,
  };
}

export async function listOwnedBudgets(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<RawBudget>(sql`
    select
      budget.id,
      budget.category_id,
      category.name as category_name,
      budget.budget_month::text,
      budget.amount::text,
      budget.warning_threshold_bps,
      budget.status,
      coalesce((
        select sum(transaction.amount)
        from transactions as transaction
        where transaction.user_id = ${userId}
          and transaction.category_id = budget.category_id
          and transaction.type = 'expense'
          and transaction.deleted_at is null
          and transaction.transaction_at >=
            (budget.budget_month::timestamp at time zone 'Asia/Jakarta')
          and transaction.transaction_at <
            ((budget.budget_month + interval '1 month')::timestamp at time zone 'Asia/Jakarta')
      ), 0)::text as usage
    from budgets as budget
    inner join categories as category
      on category.id = budget.category_id
      and category.user_id = ${userId}
    where budget.user_id = ${userId}
    order by
      budget.budget_month desc,
      case when budget.status = 'active' then 0 else 1 end,
      lower(category.name),
      budget.id
  `);
  return result.rows.map(mapBudget);
}

export async function getOwnedBudget(
  userId: string,
  budgetId: string,
  database: Database = db,
) {
  const rows = await listOwnedBudgets(userId, database);
  return rows.find((row) => row.id === budgetId) ?? null;
}

export async function listActiveExpenseCategoryOptions(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<{ id: string; name: string }>(sql`
    select id, name
    from categories
    where user_id = ${userId}
      and type = 'expense'
      and status = 'active'
    order by lower(name), id
  `);
  return result.rows;
}

export async function listCurrentBudgetAlerts(
  userId: string,
  currentMonth: string,
  database: Database = db,
) {
  const rows = await listOwnedBudgets(userId, database);
  return rows.filter(
    (row) =>
      row.recordStatus === "active" &&
      row.month === currentMonth &&
      row.budgetStatus !== "safe",
  );
}
