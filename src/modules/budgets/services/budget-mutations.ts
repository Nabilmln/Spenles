import "server-only";

import { sql } from "drizzle-orm";
import { hasPostgresErrorCode } from "@/db/errors";
import type { Database } from "@/db/types";

export type BudgetMutationInput = {
  categoryId: string;
  periodType: "monthly" | "weekly" | "custom";
  periodStart: string | null;
  periodEnd: string | null;
  amount: bigint;
  warningThresholdBps: number | null;
  warningDaysRemaining: number | null;
};

type ReturnedId = { id: string };

export async function createOwnedBudget(
  database: Database,
  userId: string,
  input: BudgetMutationInput,
) {
  try {
    const result = await database.execute<ReturnedId>(sql`
      insert into budgets (
        user_id,
        category_id,
        period_type,
        period_start,
        period_end,
        amount,
        warning_threshold_bps,
        warning_days_remaining
      )
      select
        ${userId},
        category.id,
        ${input.periodType}::budget_period_type,
        ${input.periodStart}::date,
        ${input.periodEnd}::date,
        ${input.amount}::bigint,
        ${input.warningThresholdBps}::smallint,
        ${input.warningDaysRemaining}::smallint
      from categories as category
      where category.id = ${input.categoryId}::uuid
        and category.user_id = ${userId}
        and category.type = 'expense'
        and category.status = 'active'
      returning id
    `);
    return result.rows[0]
      ? { ok: true as const, id: result.rows[0].id }
      : { ok: false as const, reason: "unavailable" as const };
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}

export async function updateOwnedBudget(
  database: Database,
  userId: string,
  budgetId: string,
  values: BudgetMutationInput,
) {
  try {
    const result = await database.execute<ReturnedId>(sql`
      update budgets as budget
      set
        category_id = ${values.categoryId}::uuid,
        period_type = ${values.periodType}::budget_period_type,
        period_start = ${values.periodStart}::date,
        period_end = ${values.periodEnd}::date,
        amount = ${values.amount}::bigint,
        warning_threshold_bps = ${values.warningThresholdBps}::smallint,
        warning_days_remaining = ${values.warningDaysRemaining}::smallint,
        updated_at = now()
      where budget.id = ${budgetId}::uuid
        and budget.user_id = ${userId}
        and budget.status = 'active'
        and (
          budget.category_id = ${values.categoryId}::uuid
          or exists (
            select 1 from categories as category
            where category.id = ${values.categoryId}::uuid
              and category.user_id = ${userId}
              and category.type = 'expense'
              and category.status = 'active'
          )
        )
      returning budget.id
    `);
    return result.rows[0] ?? null;
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return null;
    }
    throw error;
  }
}

export async function setOwnedBudgetStatus(
  database: Database,
  userId: string,
  budgetId: string,
  status: "active" | "archived",
) {
  try {
    const result = await database.execute<ReturnedId>(sql`
      update budgets as budget
      set status = ${status}::record_status, updated_at = now()
      where budget.id = ${budgetId}::uuid
        and budget.user_id = ${userId}
        and (
          ${status}::record_status = 'archived'
          or exists (
            select 1 from categories as category
            where category.id = budget.category_id
              and category.user_id = ${userId}
              and category.type = 'expense'
              and category.status = 'active'
          )
        )
      returning budget.id
    `);
    return result.rows[0]
      ? { ok: true as const, id: result.rows[0].id }
      : { ok: false as const, reason: "unavailable" as const };
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}

export async function deleteOwnedBudget(
  database: Database,
  userId: string,
  budgetId: string,
) {
  const result = await database.execute<ReturnedId>(sql`
    delete from budgets as budget
    where budget.id = ${budgetId}::uuid
      and budget.user_id = ${userId}
    returning budget.id
  `);
  return result.rows[0] ?? null;
}