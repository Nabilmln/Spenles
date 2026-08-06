import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, categories } from "@/db/schema";

export async function getReportOptions(userId: string) {
  const [ownedAccounts, ownedCategories] = await Promise.all([
    db
      .select({ id: accounts.id, name: accounts.name, status: accounts.status })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.currency, "IDR")))
      .orderBy(asc(accounts.name), asc(accounts.id)),
    db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
        status: categories.status,
      })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name), asc(categories.id)),
  ]);
  return { accounts: ownedAccounts, categories: ownedCategories };
}
