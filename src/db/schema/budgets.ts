import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { recordStatus } from "./accounts";
import { categories } from "./categories";
import { profiles } from "./profiles";

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull(),
    budgetMonth: date("budget_month").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    warningThresholdBps: smallint("warning_threshold_bps")
      .notNull()
      .default(8000),
    status: recordStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "budgets_category_owner_fk",
      columns: [table.categoryId, table.userId],
      foreignColumns: [categories.id, categories.userId],
    }).onDelete("restrict"),
    check("budgets_month_first_day", sql`extract(day from ${table.budgetMonth}) = 1`),
    check("budgets_amount_positive", sql`${table.amount} > 0`),
    check("budgets_amount_safe", sql`${table.amount} <= 9007199254740991`),
    check(
      "budgets_warning_threshold_valid",
      sql`${table.warningThresholdBps} between 100 and 10000`,
    ),
    uniqueIndex("budgets_user_category_month_active_uidx")
      .on(table.userId, table.categoryId, table.budgetMonth)
      .where(sql`${table.status} = 'active'`),
    index("budgets_user_month_status_idx").on(
      table.userId,
      table.budgetMonth.desc(),
      table.status,
    ),
    index("budgets_user_category_month_idx").on(
      table.userId,
      table.categoryId,
      table.budgetMonth.desc(),
    ),
  ],
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
