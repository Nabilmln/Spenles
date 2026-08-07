import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { hasPostgresErrorCode } from "@/db/errors";
import type { Database } from "@/db/types";
import { categories } from "@/db/schema";

export async function updateOwnedCategory(
  database: Database,
  userId: string,
  categoryId: string,
  values: {
    name: string;
    normalizedName: string;
    icon: string | null;
    color: string | null;
  },
) {
  const rows = await database
    .update(categories)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning({ id: categories.id });

  return rows[0] ?? null;
}

export async function setOwnedCategoryStatus(
  database: Database,
  userId: string,
  categoryId: string,
  status: "active" | "archived",
) {
  try {
    if (status === "archived") {
      const result = await database.execute<{ id: string }>(sql`
        with archived_category as (
          update categories
          set status = 'archived', updated_at = now()
          where id = ${categoryId}::uuid
            and user_id = ${userId}
          returning id
        ),
        paused_rules as (
          update recurring_rules as rule
          set
            status = 'paused',
            pause_reason = 'blocked_category',
            last_failure_code = 'blocked_category',
            last_failure_at = now(),
            updated_at = now()
          from archived_category
          where rule.user_id = ${userId}
            and rule.category_id = archived_category.id
            and rule.status = 'active'
          returning rule.id
        )
        select id from archived_category
      `);
      return result.rows[0]
        ? { ok: true as const, id: result.rows[0].id }
        : { ok: false as const, reason: "not-found" as const };
    }
    const rows = await database
      .update(categories)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning({ id: categories.id });

    return rows[0]
      ? { ok: true as const, id: rows[0].id }
      : { ok: false as const, reason: "not-found" as const };
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}

export async function isOwnedCategoryReferenced(
  database: Database,
  userId: string,
  categoryId: string,
) {
  const rows = await database.execute<{ total: string }>(sql`
    select
      (
        (select count(*) from transactions
          where user_id = ${userId} and category_id = ${categoryId}::uuid)
        + (select count(*) from budgets
          where user_id = ${userId} and category_id = ${categoryId}::uuid)
        + (select count(*) from recurring_rules
          where user_id = ${userId} and category_id = ${categoryId}::uuid)
      )::text as total
  `);
  return BigInt(rows.rows[0]?.total ?? "0") > 0n;
}

export async function deleteOwnedCategory(
  database: Database,
  userId: string,
  categoryId: string,
) {
  const rows = await database
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning({ id: categories.id });
  return rows[0]?.id ?? null;
}
