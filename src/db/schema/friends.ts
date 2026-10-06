import { sql } from "drizzle-orm";
import { check, index, pgTable, smallint, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const friends = pgTable(
  "friends",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    avatarIndex: smallint("avatar_index"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("friends_user_id_idx").on(table.userId),
    check("friends_avatar_index_range", sql`${table.avatarIndex} BETWEEN 1 AND 6`),
  ],
);

export type Friend = typeof friends.$inferSelect;
