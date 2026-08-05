import "server-only";

import { and, eq } from "drizzle-orm";
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
    const rows = await database
      .update(categories)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning({ id: categories.id });

    return rows[0]
      ? { ok: true as const, id: rows[0].id }
      : { ok: false as const, reason: "not-found" as const };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return { ok: false as const, reason: "duplicate" as const };
    }
    throw error;
  }
}
