import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { friends } from "@/db/schema";
import type { Database } from "@/db/types";

export type FriendRow = {
  id: string;
  name: string;
  createdAt: string;
};

export async function listFriends(
  userId: string,
  database: Database = db,
): Promise<FriendRow[]> {
  const rows = await database
    .select({
      id: friends.id,
      name: friends.name,
      createdAt: friends.createdAt,
    })
    .from(friends)
    .where(eq(friends.userId, userId))
    .orderBy(asc(friends.name));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}
