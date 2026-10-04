import { check, pgTable, smallint, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    avatarIndex: smallint("avatar_index"),
    defaultCurrency: varchar("default_currency", { length: 3 })
      .notNull()
      .default("IDR"),
    timezone: varchar("timezone", { length: 64 })
      .notNull()
      .default("Asia/Jakarta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("profiles_display_name_not_blank", sql`length(trim(${table.displayName})) > 0`),
    check("profiles_currency_idr", sql`${table.defaultCurrency} = 'IDR'`),
    check("profiles_avatar_index_range", sql`${table.avatarIndex} between 1 and 5`),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
