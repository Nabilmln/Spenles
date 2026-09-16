import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  pgEnum,
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

export const budgetPeriodType = pgEnum("budget_period_type", [
  "monthly",
  "weekly",
  "custom",
]);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull(),
    periodType: budgetPeriodType("period_type").notNull().default("monthly"),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    warningThresholdBps: smallint("warning_threshold_bps"),
    warningDaysRemaining: smallint("warning_days_remaining"),
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
    check("budgets_amount_positive", sql`${table.amount} > 0`),
    check("budgets_amount_safe", sql`${table.amount} <= 9007199254740991`),
    check(
      "budgets_warning_mode_exclusive",
      sql`(${table.warningThresholdBps} is not null) <> (${table.warningDaysRemaining} is not null)`,
    ),
    check(
      "budgets_warning_threshold_valid",
      sql`${table.warningThresholdBps} is null or ${table.warningThresholdBps} between 100 and 10000`,
    ),
    check(
      "budgets_warning_days_valid",
      sql`${table.warningDaysRemaining} is null or ${table.warningDaysRemaining} in (1, 3, 5)`,
    ),
    check(
      "budgets_period_dates_valid",
      sql`(
        ${table.periodType} = 'custom'
        and ${table.periodStart} is not null
        and ${table.periodEnd} is not null
        and ${table.periodEnd} >= ${table.periodStart}
      ) or (
        ${table.periodType} <> 'custom'
        and ${table.periodStart} is null
        and ${table.periodEnd} is null
      )`,
    ),
    uniqueIndex("budgets_user_category_active_uidx")
      .on(table.userId, table.categoryId)
      .where(sql`${table.status} = 'active'`),
    index("budgets_user_status_idx").on(table.userId, table.status),
    index("budgets_user_category_idx").on(table.userId, table.categoryId),
    index("budgets_user_custom_period_idx").on(
      table.userId,
      table.periodStart,
      table.periodEnd,
    ),
  ],
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;