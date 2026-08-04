import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const accountType = pgEnum("account_type", ["cash"]);
export const recordStatus = pgEnum("record_status", ["active", "archived"]);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    type: accountType("type").notNull().default("cash"),
    currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
    openingBalance: bigint("opening_balance", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    status: recordStatus("status").notNull().default("active"),
    systemKey: varchar("system_key", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("accounts_name_not_blank", sql`length(trim(${table.name})) > 0`),
    check("accounts_currency_idr", sql`${table.currency} = 'IDR'`),
    check("accounts_opening_balance_non_negative", sql`${table.openingBalance} >= 0`),
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_user_status_idx").on(table.userId, table.status),
    uniqueIndex("accounts_user_system_key_uidx")
      .on(table.userId, table.systemKey)
      .where(sql`${table.systemKey} is not null`),
  ],
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
