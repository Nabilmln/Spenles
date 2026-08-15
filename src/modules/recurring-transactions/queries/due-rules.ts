import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";

export type DueRule = {
  id: string;
  userId: string;
  startAt: Date;
  endDate: string | null;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  scheduledFor: Date;
};

type RawDueRule = {
  id: string;
  user_id: string;
  start_at: Date;
  end_date: string | null;
  frequency: DueRule["frequency"];
  scheduled_for: Date;
};

function mapDueRule(row: RawDueRule): DueRule {
  return {
    id: row.id,
    userId: row.user_id,
    startAt: row.start_at,
    endDate: row.end_date,
    frequency: row.frequency,
    scheduledFor: row.scheduled_for,
  };
}

export async function listDueRules(
  now: Date,
  limit: number,
  database: Database = db,
) {
  const result = await database.execute<RawDueRule>(sql`
    select
      id,
      user_id,
      start_at,
      end_date::text,
      frequency,
      next_occurrence_at as scheduled_for
    from recurring_rules
    where status = 'active'
      and next_occurrence_at is not null
      and next_occurrence_at <= ${now}
    order by next_occurrence_at, id
    limit ${limit}
  `);
  return result.rows.map(mapDueRule);
}

export async function listDueRulesForUser(
  userId: string,
  now: Date,
  limit: number,
  database: Database = db,
) {
  const result = await database.execute<RawDueRule>(sql`
    select
      id,
      user_id,
      start_at,
      end_date::text,
      frequency,
      next_occurrence_at as scheduled_for
    from recurring_rules
    where user_id = ${userId}
      and status = 'active'
      and next_occurrence_at is not null
      and next_occurrence_at <= ${now}
    order by next_occurrence_at, id
    limit ${limit}
  `);
  return result.rows.map(mapDueRule);
}

export async function hasDueRules(
  now: Date,
  database: Database = db,
) {
  const result = await database.execute<{ exists: boolean }>(sql`
    select exists (
      select 1 from recurring_rules
      where status = 'active'
        and next_occurrence_at is not null
        and next_occurrence_at <= ${now}
    ) as exists
  `);
  return result.rows[0]?.exists ?? false;
}

export async function hasDueRulesForUser(
  userId: string,
  now: Date,
  database: Database = db,
) {
  const result = await database.execute<{ exists: boolean }>(sql`
    select exists (
      select 1 from recurring_rules
      where user_id = ${userId}
        and status = 'active'
        and next_occurrence_at is not null
        and next_occurrence_at <= ${now}
    ) as exists
  `);
  return result.rows[0]?.exists ?? false;
}
