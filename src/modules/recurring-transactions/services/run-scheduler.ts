import "server-only";

import { db } from "@/db";
import type { Database } from "@/db/types";
import { firstOccurrenceAfter } from "@/lib/dates/recurrence";
import { hasDueRules, listDueRules } from "../queries/due-rules";
import { generateOccurrence } from "./generate-occurrence";

const MAX_OCCURRENCES = 50;
const CONCURRENCY = 5;

export async function runRecurringScheduler(
  now = new Date(),
  database: Database = db,
) {
  const due = await listDueRules(now, MAX_OCCURRENCES, database);
  const counts = {
    processed: 0,
    generated: 0,
    blocked: 0,
    duplicates: 0,
    failed: 0,
  };

  for (let offset = 0; offset < due.length; offset += CONCURRENCY) {
    const results = await Promise.all(
      due.slice(offset, offset + CONCURRENCY).map(async (rule) => {
        const next = firstOccurrenceAfter(
          rule.startAt,
          rule.frequency,
          rule.scheduledFor,
          rule.endDate,
        );
        return generateOccurrence(database, rule, next, now);
      }),
    );
    for (const result of results) {
      counts.processed += 1;
      if (result.status === "duplicate") counts.duplicates += 1;
      else counts[result.status] += 1;
    }
  }

  return {
    ok: counts.failed === 0,
    ...counts,
    hasMore: await hasDueRules(now, database),
  };
}
