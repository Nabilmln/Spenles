import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { hasPostgresErrorCode } from "@/db/errors";
import type { Database } from "@/db/types";
import type { DueRule } from "../queries/due-rules";

type ReturnedId = { id: string };

export async function generateOccurrence(
  database: Database,
  due: DueRule,
  nextOccurrenceAt: Date | null,
  now: Date,
) {
  const transactionId = randomUUID();
  const generationId = randomUUID();
  try {
    const result = await database.execute<ReturnedId>(sql`
      with eligible as (
        select rule.*
        from recurring_rules as rule
        inner join accounts as account
          on account.id = rule.account_id
          and account.user_id = rule.user_id
          and account.status = 'active'
          and account.currency = 'IDR'
        inner join categories as category
          on category.id = rule.category_id
          and category.user_id = rule.user_id
          and category.status = 'active'
          and category.type = rule.type
        where rule.id = ${due.id}::uuid
          and rule.user_id = ${due.userId}
          and rule.status = 'active'
          and rule.next_occurrence_at = ${due.scheduledFor}
          and rule.next_occurrence_at <= ${now}
        for update of rule
      ),
      inserted_transaction as (
        insert into transactions (
          id, user_id, account_id, category_id, type,
          amount, transaction_at, note
        )
        select
          ${transactionId}::uuid,
          eligible.user_id,
          eligible.account_id,
          eligible.category_id,
          eligible.type,
          eligible.amount,
          eligible.next_occurrence_at,
          eligible.note
        from eligible
        returning id, user_id
      ),
      inserted_generation as (
        insert into recurring_generations (
          id, user_id, recurring_rule_id, scheduled_for, transaction_id
        )
        select
          ${generationId}::uuid,
          inserted_transaction.user_id,
          ${due.id}::uuid,
          ${due.scheduledFor},
          inserted_transaction.id
        from inserted_transaction
        returning recurring_rule_id
      ),
      advanced as (
        update recurring_rules as rule
        set
          next_occurrence_at = ${nextOccurrenceAt}::timestamptz,
          status = case
            when ${nextOccurrenceAt}::timestamptz is null then 'archived'::recurring_status
            else 'active'::recurring_status
          end,
          pause_reason = null,
          last_failure_code = null,
          last_failure_at = null,
          updated_at = now()
        from inserted_generation
        where rule.id = inserted_generation.recurring_rule_id
        returning rule.id
      )
      select id from advanced
    `);
    if (result.rows[0]) return { status: "generated" as const };

    const existing = await database.execute<{ exists: boolean }>(sql`
      select exists (
        select 1 from recurring_generations
        where recurring_rule_id = ${due.id}::uuid
          and scheduled_for = ${due.scheduledFor}
      ) as exists
    `);
    if (existing.rows[0]?.exists) return { status: "duplicate" as const };

    const blocked = await database.execute<{ reason: string }>(sql`
      update recurring_rules as rule
      set
        status = 'paused',
        pause_reason = case
          when not exists (
            select 1 from accounts
            where accounts.id = rule.account_id
              and accounts.user_id = rule.user_id
              and accounts.status = 'active'
              and accounts.currency = 'IDR'
          ) then 'blocked_account'::recurring_pause_reason
          else 'blocked_category'::recurring_pause_reason
        end,
        last_failure_code = case
          when not exists (
            select 1 from accounts
            where accounts.id = rule.account_id
              and accounts.user_id = rule.user_id
              and accounts.status = 'active'
              and accounts.currency = 'IDR'
          ) then 'blocked_account'
          else 'blocked_category'
        end,
        last_failure_at = now(),
        updated_at = now()
      where rule.id = ${due.id}::uuid
        and rule.user_id = ${due.userId}
        and rule.status = 'active'
        and rule.next_occurrence_at = ${due.scheduledFor}
      returning rule.pause_reason::text as reason
    `);
    return blocked.rows[0]
      ? { status: "blocked" as const }
      : { status: "duplicate" as const };
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return { status: "duplicate" as const };
    }
    await database.execute(sql`
      update recurring_rules
      set
        status = 'paused',
        pause_reason = 'generation_failure',
        last_failure_code = 'generation_failure',
        last_failure_at = now(),
        updated_at = now()
      where id = ${due.id}::uuid
        and user_id = ${due.userId}
        and status = 'active'
        and next_occurrence_at = ${due.scheduledFor}
    `);
    return { status: "failed" as const };
  }
}
