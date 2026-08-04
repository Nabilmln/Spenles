import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { categories, categoryType } from "./categories";
import { profiles } from "./profiles";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    accountId: uuid("account_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    type: categoryType("type").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    transactionAt: timestamp("transaction_at", { withTimezone: true }).notNull(),
    note: varchar("note", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    foreignKey({
      name: "transactions_account_owner_fk",
      columns: [table.accountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }).onDelete("restrict"),
    foreignKey({
      name: "transactions_category_owner_type_fk",
      columns: [table.categoryId, table.userId, table.type],
      foreignColumns: [categories.id, categories.userId, categories.type],
    }).onDelete("restrict"),
    check("transactions_amount_positive", sql`${table.amount} > 0`),
    check(
      "transactions_amount_safe",
      sql`${table.amount} <= 9007199254740991`,
    ),
    check(
      "transactions_note_valid",
      sql`${table.note} is null or length(trim(${table.note})) between 1 and 500`,
    ),
    index("transactions_user_occurred_id_active_idx")
      .on(table.userId, table.transactionAt.desc(), table.id.desc())
      .where(sql`${table.deletedAt} is null`),
    index("transactions_user_type_occurred_active_idx")
      .on(table.userId, table.type, table.transactionAt.desc())
      .where(sql`${table.deletedAt} is null`),
    index("transactions_user_category_occurred_active_idx")
      .on(table.userId, table.categoryId, table.transactionAt.desc())
      .where(sql`${table.deletedAt} is null`),
    index("transactions_user_account_occurred_active_idx")
      .on(table.userId, table.accountId, table.transactionAt.desc())
      .where(sql`${table.deletedAt} is null`),
    index("transactions_user_amount_id_active_idx")
      .on(table.userId, table.amount, table.id)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
