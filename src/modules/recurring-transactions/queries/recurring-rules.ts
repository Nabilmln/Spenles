import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";

export type RecurringRuleListRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startAt: Date;
  endDate: string | null;
  nextOccurrenceAt: Date | null;
  status: "active" | "paused" | "archived";
  pauseReason:
    | "user"
    | "blocked_account"
    | "blocked_category"
    | "generation_failure"
    | null;
  note: string | null;
  lastFailureCode: string | null;
};

type RawRule = {
  id: string;
  type: RecurringRuleListRow["type"];
  amount: string;
  account_id: string;
  account_name: string;
  category_id: string;
  category_name: string;
  frequency: RecurringRuleListRow["frequency"];
  start_at: Date;
  end_date: string | null;
  next_occurrence_at: Date | null;
  status: RecurringRuleListRow["status"];
  pause_reason: RecurringRuleListRow["pauseReason"];
  note: string | null;
  last_failure_code: string | null;
};

function mapRule(row: RawRule): RecurringRuleListRow {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    accountId: row.account_id,
    accountName: row.account_name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    frequency: row.frequency,
    startAt: row.start_at,
    endDate: row.end_date,
    nextOccurrenceAt: row.next_occurrence_at,
    status: row.status,
    pauseReason: row.pause_reason,
    note: row.note,
    lastFailureCode: row.last_failure_code,
  };
}

export async function listOwnedRecurringRules(
  userId: string,
  database: Database = db,
) {
  const result = await database.execute<RawRule>(sql`
    select
      rule.id,
      rule.type,
      rule.amount::text,
      rule.account_id,
      account.name as account_name,
      rule.category_id,
      category.name as category_name,
      rule.frequency,
      rule.start_at,
      rule.end_date::text,
      rule.next_occurrence_at,
      rule.status,
      rule.pause_reason,
      rule.note,
      rule.last_failure_code
    from recurring_rules as rule
    inner join accounts as account
      on account.id = rule.account_id
      and account.user_id = ${userId}
    inner join categories as category
      on category.id = rule.category_id
      and category.user_id = ${userId}
    where rule.user_id = ${userId}
    order by
      case rule.status when 'active' then 0 when 'paused' then 1 else 2 end,
      rule.next_occurrence_at nulls last,
      rule.id
  `);
  return result.rows.map(mapRule);
}

export async function getOwnedRecurringRule(
  userId: string,
  ruleId: string,
  database: Database = db,
) {
  const result = await database.execute<RawRule>(sql`
    select
      rule.id,
      rule.type,
      rule.amount::text,
      rule.account_id,
      account.name as account_name,
      rule.category_id,
      category.name as category_name,
      rule.frequency,
      rule.start_at,
      rule.end_date::text,
      rule.next_occurrence_at,
      rule.status,
      rule.pause_reason,
      rule.note,
      rule.last_failure_code
    from recurring_rules as rule
    inner join accounts as account
      on account.id = rule.account_id
      and account.user_id = ${userId}
    inner join categories as category
      on category.id = rule.category_id
      and category.user_id = ${userId}
    where rule.user_id = ${userId}
      and rule.id = ${ruleId}
    limit 1
  `);
  const row = result.rows[0];
  return row ? mapRule(row) : null;
}

export async function listRecurringOptions(
  userId: string,
  database: Database = db,
) {
  const [accounts, categories] = await Promise.all([
    database.execute<{ id: string; name: string }>(sql`
      select id, name from accounts
      where user_id = ${userId} and status = 'active' and currency = 'IDR'
      order by lower(name), id
    `),
    database.execute<{ id: string; name: string; type: "income" | "expense" }>(sql`
      select id, name, type from categories
      where user_id = ${userId} and status = 'active'
      order by type, lower(name), id
    `),
  ]);
  return { accounts: accounts.rows, categories: categories.rows };
}

export async function listRecurringFailureAlerts(
  userId: string,
  database: Database = db,
) {
  const rows = await listOwnedRecurringRules(userId, database);
  return rows.filter(
    (row) =>
      row.pauseReason === "blocked_account" ||
      row.pauseReason === "blocked_category" ||
      row.pauseReason === "generation_failure" ||
      row.lastFailureCode !== null,
  );
}
