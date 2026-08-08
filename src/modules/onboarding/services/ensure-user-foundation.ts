import "server-only";

import { sql } from "drizzle-orm";
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

type FoundationCounts = {
  profileCount: number;
  categoryCount: number;
  accountCount: number;
};

type ReadinessRow = {
  profile_count: number;
  category_count: number;
  account_count: number;
};

async function readFoundationCounts(
  database: Database,
  userId: string,
  categoryKeys: string[],
): Promise<FoundationCounts> {
  const categoryKeyArrayLiteral = `{${categoryKeys.join(",")}}`;
  const result = await database.execute<ReadinessRow>(sql`
    select
      (select count(*)::int from profiles where user_id = ${userId}) as profile_count,
      (
        select count(*)::int from categories
        where user_id = ${userId}
          and system_key = any(${categoryKeyArrayLiteral}::text[])
      ) as category_count,
      (
        select count(*)::int from accounts
        where user_id = ${userId} and system_key = ${DEFAULT_ACCOUNT_KEY}
      ) as account_count
  `);

  const row = result.rows[0];
  if (!row) throw new Error("Query inisialisasi pengguna tidak mengembalikan baris.");

  return {
    profileCount: row.profile_count,
    categoryCount: row.category_count,
    accountCount: row.account_count,
  };
}

function isFoundationComplete(counts: FoundationCounts) {
  return (
    counts.profileCount === 1 &&
    counts.categoryCount === DEFAULT_CATEGORIES.length &&
    counts.accountCount === 1
  );
}

export async function ensureUserFoundationWithDatabase(
  database: Database,
  user: FoundationUser,
) {
  const displayName = user.name.trim() || "Pengguna Spenles";
  const categoryKeys = DEFAULT_CATEGORIES.map((category) => category.systemKey);

  const existingCounts = await readFoundationCounts(database, user.id, categoryKeys);
  if (isFoundationComplete(existingCounts)) {
    return {
      profileCreated: true,
      categoryCount: existingCounts.categoryCount,
      accountCount: existingCounts.accountCount,
    };
  }

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

  const verifiedCounts = await readFoundationCounts(database, user.id, categoryKeys);
  if (!isFoundationComplete(verifiedCounts)) {
    throw new Error("Inisialisasi akun belum lengkap.");
  }

  return {
    profileCreated: true,
    categoryCount: verifiedCounts.categoryCount,
    accountCount: verifiedCounts.accountCount,
  };
}

export function ensureUserFoundation(user: FoundationUser) {
  return ensureUserFoundationWithDatabase(db, user);
}
