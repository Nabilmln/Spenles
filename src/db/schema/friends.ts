import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const friends = pgTable(
  "friends",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("friends_user_id_idx").on(table.userId),
  ],
);

export type Friend = typeof friends.$inferSelect;
