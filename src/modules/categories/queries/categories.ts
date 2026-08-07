import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export function listCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.type), asc(categories.status), asc(categories.name));
}

export async function getCategory(userId: string, id: string) {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.id, id)))
    .limit(1);
  return rows[0];
}

export async function listDeletableCategoryIds(
  userId: string,
): Promise<Set<string>> {
  const rows = await db.execute<{ category_id: string }>(sql`
    select owned_category.id as category_id
    from categories as owned_category
    where owned_category.user_id = ${userId}
      and not exists (
        select 1 from transactions as reference_transaction
        where reference_transaction.user_id = ${userId}
          and reference_transaction.category_id = owned_category.id
      )
      and not exists (
        select 1 from budgets as reference_budget
        where reference_budget.user_id = ${userId}
          and reference_budget.category_id = owned_category.id
      )
      and not exists (
        select 1 from recurring_rules as reference_rule
        where reference_rule.user_id = ${userId}
          and reference_rule.category_id = owned_category.id
      )
  `);
  return new Set(rows.rows.map((row) => row.category_id));
}
