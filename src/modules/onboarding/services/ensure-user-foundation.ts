import "server-only";

import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { accounts, categories, profiles } from "@/db/schema";
import { DEFAULT_CATEGORIES } from "@/db/seed/default-categories";

export type FoundationUser = {
  id: string;
  name: string;
};

const DEFAULT_ACCOUNT_KEY = "default-cash-account";

export async function ensureUserFoundation(user: FoundationUser) {
  const displayName = user.name.trim() || "Pengguna Spenles";
  const categoryKeys = DEFAULT_CATEGORIES.map((category) => category.systemKey);

  await db.batch([
    db
      .insert(profiles)
      .values({ userId: user.id, displayName })
      .onConflictDoNothing(),
    db
      .insert(categories)
      .values(
        DEFAULT_CATEGORIES.map((category) => ({
          userId: user.id,
          name: category.name,
          type: category.type,
          systemKey: category.systemKey,
          isDefault: true,
        })),
      )
      .onConflictDoNothing(),
    db
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
    db
      .select({ value: count() })
      .from(profiles)
      .where(eq(profiles.userId, user.id)),
    db
      .select({ value: count() })
      .from(categories)
      .where(
        and(
          eq(categories.userId, user.id),
          inArray(categories.systemKey, categoryKeys),
        ),
      ),
    db
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
