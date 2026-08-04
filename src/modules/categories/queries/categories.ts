import "server-only";

import { and, asc, eq } from "drizzle-orm";
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
