import "server-only";

import { sql } from "drizzle-orm";
import { hasPostgresErrorCode } from "@/db/errors";
import type { Database } from "@/db/types";

export type BudgetMutationInput = {
  categoryId: string;
  budgetMonth: string;
  amount: bigint;
  warningThresholdBps: number;
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
        budget_month,
        amount,
        warning_threshold_bps
      )
      select
        ${userId},
        category.id,
        ${input.budgetMonth}::date,
        ${input.amount}::bigint,
        ${input.warningThresholdBps}::smallint
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
  values: Pick<BudgetMutationInput, "amount" | "warningThresholdBps">,
) {
  const result = await database.execute<ReturnedId>(sql`
    update budgets
    set
      amount = ${values.amount}::bigint,
      warning_threshold_bps = ${values.warningThresholdBps}::smallint,
      updated_at = now()
    where id = ${budgetId}::uuid
      and user_id = ${userId}
      and status = 'active'
    returning id
  `);
  return result.rows[0] ?? null;
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
