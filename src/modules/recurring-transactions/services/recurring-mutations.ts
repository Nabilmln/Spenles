import "server-only";

import { sql } from "drizzle-orm";
import type { Database } from "@/db/types";
import {
  firstOccurrenceAfter,
  type RecurringFrequency,
} from "@/lib/dates/recurrence";

export type RecurringMutationInput = {
  type: "income" | "expense";
  amount: bigint;
  accountId: string;
  categoryId: string;
  frequency: RecurringFrequency;
  startAt: Date;
  endDate: string | null;
  nextOccurrenceAt: Date | null;
  note: string | null;
};

type ReturnedId = { id: string };

export async function createOwnedRecurringRule(
  database: Database,
  userId: string,
  input: RecurringMutationInput,
) {
  const result = await database.execute<ReturnedId>(sql`
    insert into recurring_rules (
      user_id, type, amount, account_id, category_id, frequency,
      start_at, end_date, next_occurrence_at, status, note
    )
    select
      ${userId},
      ${input.type}::category_type,
      ${input.amount}::bigint,
      account.id,
      category.id,
      ${input.frequency}::recurring_frequency,
      ${input.startAt},
      ${input.endDate}::date,
      ${input.nextOccurrenceAt},
      ${input.nextOccurrenceAt ? "active" : "archived"}::recurring_status,
      ${input.note}
    from accounts as account
    cross join categories as category
    where account.id = ${input.accountId}::uuid
      and account.user_id = ${userId}
      and account.status = 'active'
      and account.currency = 'IDR'
      and category.id = ${input.categoryId}::uuid
      and category.user_id = ${userId}
      and category.status = 'active'
      and category.type = ${input.type}::category_type
    returning id
  `);
  return result.rows[0] ?? null;
}

export async function updateOwnedRecurringRule(
  database: Database,
  userId: string,
  ruleId: string,
  input: Omit<RecurringMutationInput, "startAt">,
) {
  const result = await database.execute<ReturnedId>(sql`
    update recurring_rules as rule
    set
      type = ${input.type}::category_type,
      amount = ${input.amount}::bigint,
      account_id = ${input.accountId}::uuid,
      category_id = ${input.categoryId}::uuid,
      frequency = ${input.frequency}::recurring_frequency,
      end_date = ${input.endDate}::date,
      next_occurrence_at = case
        when rule.status = 'active' then ${input.nextOccurrenceAt}
        else rule.next_occurrence_at
      end,
      status = case
        when rule.status = 'active' and ${input.nextOccurrenceAt} is null
          then 'archived'::recurring_status
        else rule.status
      end,
      note = ${input.note},
      updated_at = now()
    where rule.id = ${ruleId}::uuid
      and rule.user_id = ${userId}
      and rule.status <> 'archived'
      and exists (
        select 1 from accounts as account
        where account.id = ${input.accountId}::uuid
          and account.user_id = ${userId}
          and account.status = 'active'
          and account.currency = 'IDR'
      )
      and exists (
        select 1 from categories as category
        where category.id = ${input.categoryId}::uuid
          and category.user_id = ${userId}
          and category.status = 'active'
          and category.type = ${input.type}::category_type
      )
    returning rule.id
  `);
  return result.rows[0] ?? null;
}

export async function pauseOwnedRecurringRule(
  database: Database,
  userId: string,
  ruleId: string,
) {
  const result = await database.execute<ReturnedId>(sql`
    update recurring_rules
    set
      status = 'paused',
      pause_reason = 'user',
      last_failure_code = null,
      last_failure_at = null,
      updated_at = now()
    where id = ${ruleId}::uuid
      and user_id = ${userId}
      and status = 'active'
    returning id
  `);
  return result.rows[0] ?? null;
}

export async function resumeOwnedRecurringRule(
  database: Database,
  userId: string,
  ruleId: string,
  now: Date,
) {
  const found = await database.execute<{
    start_at: Date;
    frequency: RecurringFrequency;
    end_date: string | null;
  }>(sql`
    select start_at, frequency, end_date::text
    from recurring_rules
    where id = ${ruleId}::uuid
      and user_id = ${userId}
      and status = 'paused'
    limit 1
  `);
  const rule = found.rows[0];
  if (!rule) return null;
  const next = firstOccurrenceAfter(
    rule.start_at,
    rule.frequency,
    now,
    rule.end_date,
  );
  if (!next) return null;

  const result = await database.execute<ReturnedId>(sql`
    update recurring_rules as rule
    set
      status = 'active',
      pause_reason = null,
      next_occurrence_at = ${next},
      last_failure_code = null,
      last_failure_at = null,
      updated_at = now()
    where rule.id = ${ruleId}::uuid
      and rule.user_id = ${userId}
      and rule.status = 'paused'
      and exists (
        select 1 from accounts as account
        where account.id = rule.account_id
          and account.user_id = ${userId}
          and account.status = 'active'
          and account.currency = 'IDR'
      )
      and exists (
        select 1 from categories as category
        where category.id = rule.category_id
          and category.user_id = ${userId}
          and category.status = 'active'
          and category.type = rule.type
      )
    returning rule.id
  `);
  return result.rows[0] ?? null;
}

export async function archiveOwnedRecurringRule(
  database: Database,
  userId: string,
  ruleId: string,
) {
  const result = await database.execute<ReturnedId>(sql`
    update recurring_rules
    set
      status = 'archived',
      pause_reason = null,
      next_occurrence_at = null,
      updated_at = now()
    where id = ${ruleId}::uuid
      and user_id = ${userId}
    returning id
  `);
  return result.rows[0] ?? null;
}
