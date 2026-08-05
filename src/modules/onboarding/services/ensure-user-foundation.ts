import "server-only";

import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import type { Database } from "@/db/types";
import { accounts, categories, profiles } from "@/db/schema";
import {
  DEFAULT_CATEGORIES,
  normalizeSeedCategoryName,
} from "@/db/seed/default-categories";

export type FoundationUser = {
  id: string;
  name: string;
};

const DEFAULT_ACCOUNT_KEY = "default-cash-account";

export async function ensureUserFoundationWithDatabase(
  database: Database,
  user: FoundationUser,
) {
  const displayName = user.name.trim() || "Pengguna Spenles";
  const categoryKeys = DEFAULT_CATEGORIES.map((category) => category.systemKey);

  await database.batch([
    database
      .insert(profiles)
      .values({ userId: user.id, displayName })
      .onConflictDoNothing(),
    database
      .insert(categories)
      .values(
        DEFAULT_CATEGORIES.map((category) => ({
          userId: user.id,
          name: category.name,
          normalizedName: normalizeSeedCategoryName(category.name),
          type: category.type,
          systemKey: category.systemKey,
          isDefault: true,
        })),
      )
      .onConflictDoNothing(),
    database
      .insert(accounts)
      .values({
        userId: user.id,
        name: "Kas Utama",
        type: "cash",
        currency: "IDR",
        openingBalance: BigInt(0),
        systemKey: DEFAULT_ACCOUNT_KEY,
      })
      .onConflictDoNothing(),
  ]);

  const [profileCount, categoryCount, accountCount] = await Promise.all([
    database
      .select({ value: count() })
      .from(profiles)
      .where(eq(profiles.userId, user.id)),
    database
      .select({ value: count() })
      .from(categories)
      .where(
        and(
          eq(categories.userId, user.id),
          inArray(categories.systemKey, categoryKeys),
        ),
      ),
    database
      .select({ value: count() })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.systemKey, DEFAULT_ACCOUNT_KEY),
        ),
      ),
  ]);

  if (
    profileCount[0]?.value !== 1 ||
    categoryCount[0]?.value !== DEFAULT_CATEGORIES.length ||
    accountCount[0]?.value !== 1
  ) {
    throw new Error("Inisialisasi akun belum lengkap.");
  }

  return {
    profileCreated: true,
    categoryCount: categoryCount[0].value,
    accountCount: accountCount[0].value,
  };
}

export function ensureUserFoundation(user: FoundationUser) {
  return ensureUserFoundationWithDatabase(db, user);
}
