import { sql } from "drizzle-orm";
import {
  boolean,
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
import { recordStatus } from "./accounts";

export const categoryType = pgEnum("category_type", ["income", "expense"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 80 }).notNull(),
    type: categoryType("type").notNull(),
    icon: varchar("icon", { length: 64 }),
    color: varchar("color", { length: 32 }),
    isDefault: boolean("is_default").notNull().default(false),
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
    check("categories_name_not_blank", sql`length(trim(${table.name})) > 0`),
    check(
      "categories_default_has_system_key",
      sql`not ${table.isDefault} or ${table.systemKey} is not null`,
    ),
    index("categories_user_id_idx").on(table.userId),
    index("categories_user_type_idx").on(table.userId, table.type),
    index("categories_user_status_idx").on(table.userId, table.status),
    uniqueIndex("categories_user_system_key_uidx")
      .on(table.userId, table.systemKey)
      .where(sql`${table.systemKey} is not null`),
    uniqueIndex("categories_user_type_normalized_name_active_uidx")
      .on(table.userId, table.type, table.normalizedName)
      .where(sql`${table.status} = 'active'`),
    uniqueIndex("categories_id_user_type_uidx").on(
      table.id,
      table.userId,
      table.type,
    ),
    uniqueIndex("categories_id_user_id_uidx").on(table.id, table.userId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
