import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { categories, categoryType } from "./categories";
import { profiles } from "./profiles";
import { transactions } from "./transactions";

export const recurringFrequency = pgEnum("recurring_frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const recurringStatus = pgEnum("recurring_status", [
  "active",
  "paused",
  "archived",
]);

export const recurringPauseReason = pgEnum("recurring_pause_reason", [
  "user",
  "blocked_account",
  "blocked_category",
  "generation_failure",
]);

export const recurringRules = pgTable(
  "recurring_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    type: categoryType("type").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    accountId: uuid("account_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    frequency: recurringFrequency("frequency").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endDate: date("end_date"),
    nextOccurrenceAt: timestamp("next_occurrence_at", { withTimezone: true }),
    status: recurringStatus("status").notNull().default("active"),
    pauseReason: recurringPauseReason("pause_reason"),
    note: varchar("note", { length: 500 }),
    lastFailureCode: varchar("last_failure_code", { length: 64 }),
    lastFailureAt: timestamp("last_failure_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "recurring_rules_account_owner_fk",
      columns: [table.accountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }).onDelete("restrict"),
    foreignKey({
      name: "recurring_rules_category_owner_type_fk",
      columns: [table.categoryId, table.userId, table.type],
      foreignColumns: [categories.id, categories.userId, categories.type],
    }).onDelete("restrict"),
    check("recurring_rules_amount_positive", sql`${table.amount} > 0`),
    check(
      "recurring_rules_amount_safe",
      sql`${table.amount} <= 9007199254740991`,
    ),
    check(
      "recurring_rules_note_valid",
      sql`${table.note} is null or length(trim(${table.note})) between 1 and 500`,
    ),
    check(
      "recurring_rules_pause_reason_valid",
      sql`(${table.status} = 'paused' and ${table.pauseReason} is not null)
        or (${table.status} <> 'paused' and ${table.pauseReason} is null)`,
    ),
    check(
      "recurring_rules_failure_state_valid",
      sql`(${table.lastFailureCode} is null) = (${table.lastFailureAt} is null)`,
    ),
    check(
      "recurring_rules_end_not_before_start",
      sql`${table.endDate} is null or ${table.endDate} >=
        (${table.startAt} at time zone 'Asia/Jakarta')::date`,
    ),
    uniqueIndex("recurring_rules_id_user_id_uidx").on(table.id, table.userId),
    index("recurring_rules_user_status_next_idx").on(
      table.userId,
      table.status,
      table.nextOccurrenceAt,
    ),
    index("recurring_rules_user_account_status_idx").on(
      table.userId,
      table.accountId,
      table.status,
    ),
    index("recurring_rules_user_category_status_idx").on(
      table.userId,
      table.categoryId,
      table.status,
    ),
    index("recurring_rules_due_idx")
      .on(table.nextOccurrenceAt, table.id)
      .where(sql`${table.status} = 'active' and ${table.nextOccurrenceAt} is not null`),
  ],
);

export const recurringGenerations = pgTable(
  "recurring_generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    recurringRuleId: uuid("recurring_rule_id").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    transactionId: uuid("transaction_id").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "recurring_generations_rule_owner_fk",
      columns: [table.recurringRuleId, table.userId],
      foreignColumns: [recurringRules.id, recurringRules.userId],
    }).onDelete("restrict"),
    foreignKey({
      name: "recurring_generations_transaction_owner_fk",
      columns: [table.transactionId, table.userId],
      foreignColumns: [transactions.id, transactions.userId],
    }).onDelete("restrict"),
    uniqueIndex("recurring_generations_rule_scheduled_uidx").on(
      table.recurringRuleId,
      table.scheduledFor,
    ),
    uniqueIndex("recurring_generations_transaction_uidx").on(table.transactionId),
    index("recurring_generations_user_generated_idx").on(
      table.userId,
      table.generatedAt.desc(),
    ),
  ],
);

export type RecurringRule = typeof recurringRules.$inferSelect;
export type NewRecurringRule = typeof recurringRules.$inferInsert;
export type RecurringGeneration = typeof recurringGenerations.$inferSelect;
