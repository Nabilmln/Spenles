import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { profiles } from "./profiles";

export const transfers = pgTable(
  "transfers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    sourceAccountId: uuid("source_account_id").notNull(),
    destinationAccountId: uuid("destination_account_id").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    transferredAt: timestamp("transferred_at", { withTimezone: true }).notNull(),
    note: varchar("note", { length: 500 }),
    reversalOfId: uuid("reversal_of_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "transfers_source_account_owner_fk",
      columns: [table.sourceAccountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }).onDelete("restrict"),
    foreignKey({
      name: "transfers_destination_account_owner_fk",
      columns: [table.destinationAccountId, table.userId],
      foreignColumns: [accounts.id, accounts.userId],
    }).onDelete("restrict"),
    foreignKey({
      name: "transfers_reversal_owner_fk",
      columns: [table.reversalOfId, table.userId],
      foreignColumns: [table.id, table.userId],
    }).onDelete("restrict"),
    check(
      "transfers_accounts_differ",
      sql`${table.sourceAccountId} <> ${table.destinationAccountId}`,
    ),
    check("transfers_amount_positive", sql`${table.amount} > 0`),
    check("transfers_amount_safe", sql`${table.amount} <= 9007199254740991`),
    check(
      "transfers_note_valid",
      sql`${table.note} is null or length(trim(${table.note})) between 1 and 500`,
    ),
    uniqueIndex("transfers_id_user_id_uidx").on(table.id, table.userId),
    index("transfers_user_transferred_id_idx").on(
      table.userId,
      table.transferredAt.desc(),
      table.id.desc(),
    ),
    index("transfers_user_source_transferred_idx").on(
      table.userId,
      table.sourceAccountId,
      table.transferredAt.desc(),
    ),
    index("transfers_user_destination_transferred_idx").on(
      table.userId,
      table.destinationAccountId,
      table.transferredAt.desc(),
    ),
    uniqueIndex("transfers_reversal_of_uidx")
      .on(table.reversalOfId)
      .where(sql`${table.reversalOfId} is not null`),
  ],
);

export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;
