import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const splitBillStatus = pgEnum("split_bill_status", [
  "draft",
  "finalized",
  "archived",
]);

export const splitBillDiscountMode = pgEnum("split_bill_discount_mode", [
  "none",
  "fixed",
  "percentage",
]);

export const splitBillPaymentStatus = pgEnum("split_bill_payment_status", [
  "unpaid",
  "partially_paid",
  "paid",
]);

export const splitBills = pgTable(
  "split_bills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    merchantName: varchar("merchant_name", { length: 120 }).notNull(),
    billDate: date("bill_date").notNull(),
    note: varchar("note", { length: 500 }),
    status: splitBillStatus("status").notNull().default("draft"),
    discountMode: splitBillDiscountMode("discount_mode")
      .notNull()
      .default("none"),
    fixedDiscountAmount: bigint("fixed_discount_amount", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    discountBps: smallint("discount_bps").notNull().default(0),
    billTaxBps: smallint("bill_tax_bps").notNull().default(0),
    serviceChargeBps: smallint("service_charge_bps").notNull().default(0),
    revision: integer("revision").notNull().default(0),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "split_bills_merchant_valid",
      sql`length(trim(${table.merchantName})) between 1 and 120`,
    ),
    check(
      "split_bills_note_valid",
      sql`${table.note} is null or length(trim(${table.note})) between 1 and 500`,
    ),
    check(
      "split_bills_fixed_discount_valid",
      sql`${table.fixedDiscountAmount} between 0 and 9007199254740991`,
    ),
    check(
      "split_bills_percentages_valid",
      sql`${table.discountBps} between 0 and 10000
        and ${table.billTaxBps} between 0 and 10000
        and ${table.serviceChargeBps} between 0 and 10000`,
    ),
    check(
      "split_bills_discount_mode_valid",
      sql`(${table.discountMode} = 'none'
          and ${table.fixedDiscountAmount} = 0
          and ${table.discountBps} = 0)
        or (${table.discountMode} = 'fixed'
          and ${table.fixedDiscountAmount} > 0
          and ${table.discountBps} = 0)
        or (${table.discountMode} = 'percentage'
          and ${table.fixedDiscountAmount} = 0
          and ${table.discountBps} between 1 and 10000)`,
    ),
    check("split_bills_revision_valid", sql`${table.revision} >= 0`),
    check(
      "split_bills_lifecycle_valid",
      sql`(${table.status} = 'draft'
          and ${table.finalizedAt} is null
          and ${table.archivedAt} is null)
        or (${table.status} = 'finalized'
          and ${table.finalizedAt} is not null
          and ${table.archivedAt} is null)
        or (${table.status} = 'archived'
          and ${table.finalizedAt} is not null
          and ${table.archivedAt} is not null)`,
    ),
    unique("split_bills_id_user_id_uidx").on(table.id, table.userId),
    index("split_bills_user_status_date_id_idx").on(
      table.userId,
      table.status,
      table.billDate.desc(),
      table.id.desc(),
    ),
    index("split_bills_user_date_id_idx").on(
      table.userId,
      table.billDate.desc(),
      table.id.desc(),
    ),
  ],
);

export const splitBillParticipants = pgTable(
  "split_bill_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    position: integer("position").notNull(),
    paymentStatus: splitBillPaymentStatus("payment_status")
      .notNull()
      .default("unpaid"),
    paidAmount: bigint("paid_amount", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_participants_bill_owner_fk",
      columns: [table.splitBillId, table.userId],
      foreignColumns: [splitBills.id, splitBills.userId],
    }).onDelete("cascade"),
    check(
      "split_bill_participants_name_valid",
      sql`length(trim(${table.name})) between 1 and 100`,
    ),
    check("split_bill_participants_position_valid", sql`${table.position} > 0`),
    check(
      "split_bill_participants_paid_amount_valid",
      sql`${table.paidAmount} between 0 and 9007199254740991`,
    ),
    uniqueIndex("split_bill_participants_bill_position_uidx").on(
      table.splitBillId,
      table.position,
    ),
    unique("split_bill_participants_id_bill_user_uidx").on(
      table.id,
      table.splitBillId,
      table.userId,
    ),
    index("split_bill_participants_user_bill_position_idx").on(
      table.userId,
      table.splitBillId,
      table.position,
    ),
  ],
);

export const splitBillItems = pgTable(
  "split_bill_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    position: integer("position").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: bigint("unit_price", { mode: "bigint" }).notNull(),
    itemTaxBps: smallint("item_tax_bps").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_items_bill_owner_fk",
      columns: [table.splitBillId, table.userId],
      foreignColumns: [splitBills.id, splitBills.userId],
    }).onDelete("cascade"),
    check(
      "split_bill_items_name_valid",
      sql`length(trim(${table.name})) between 1 and 120`,
    ),
    check("split_bill_items_position_valid", sql`${table.position} > 0`),
    check(
      "split_bill_items_quantity_valid",
      sql`${table.quantity} between 1 and 10000`,
    ),
    check(
      "split_bill_items_unit_price_valid",
      sql`${table.unitPrice} between 1 and 9007199254740991`,
    ),
    check(
      "split_bill_items_tax_valid",
      sql`${table.itemTaxBps} between 0 and 10000`,
    ),
    uniqueIndex("split_bill_items_bill_position_uidx").on(
      table.splitBillId,
      table.position,
    ),
    unique("split_bill_items_id_bill_user_uidx").on(
      table.id,
      table.splitBillId,
      table.userId,
    ),
    index("split_bill_items_user_bill_position_idx").on(
      table.userId,
      table.splitBillId,
      table.position,
    ),
  ],
);

export const splitBillAssignments = pgTable(
  "split_bill_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    itemId: uuid("item_id").notNull(),
    participantId: uuid("participant_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_assignments_bill_owner_fk",
      columns: [table.splitBillId, table.userId],
      foreignColumns: [splitBills.id, splitBills.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_assignments_item_owner_fk",
      columns: [table.itemId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillItems.id,
        splitBillItems.splitBillId,
        splitBillItems.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_assignments_participant_owner_fk",
      columns: [table.participantId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillParticipants.id,
        splitBillParticipants.splitBillId,
        splitBillParticipants.userId,
      ],
    }).onDelete("cascade"),
    uniqueIndex("split_bill_assignments_item_participant_uidx").on(
      table.itemId,
      table.participantId,
    ),
    unique("split_bill_assignments_id_bill_user_uidx").on(
      table.id,
      table.splitBillId,
      table.userId,
    ),
    index("split_bill_assignments_user_bill_item_idx").on(
      table.userId,
      table.splitBillId,
      table.itemId,
    ),
    index("split_bill_assignments_user_bill_participant_idx").on(
      table.userId,
      table.splitBillId,
      table.participantId,
    ),
  ],
);

export const splitBillCalculations = pgTable(
  "split_bill_calculations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    calculationVersion: smallint("calculation_version").notNull(),
    sourceRevision: integer("source_revision").notNull(),
    merchantNameSnapshot: varchar("merchant_name_snapshot", {
      length: 120,
    }).notNull(),
    billDateSnapshot: date("bill_date_snapshot").notNull(),
    noteSnapshot: varchar("note_snapshot", { length: 500 }),
    discountMode: splitBillDiscountMode("discount_mode").notNull(),
    fixedDiscountAmount: bigint("fixed_discount_amount", {
      mode: "bigint",
    }).notNull(),
    discountBps: smallint("discount_bps").notNull(),
    billTaxBps: smallint("bill_tax_bps").notNull(),
    serviceChargeBps: smallint("service_charge_bps").notNull(),
    subtotalAmount: bigint("subtotal_amount", { mode: "bigint" }).notNull(),
    discountAmount: bigint("discount_amount", { mode: "bigint" }).notNull(),
    discountedSubtotalAmount: bigint("discounted_subtotal_amount", {
      mode: "bigint",
    }).notNull(),
    itemTaxAmount: bigint("item_tax_amount", { mode: "bigint" }).notNull(),
    billTaxAmount: bigint("bill_tax_amount", { mode: "bigint" }).notNull(),
    totalTaxAmount: bigint("total_tax_amount", { mode: "bigint" }).notNull(),
    serviceChargeAmount: bigint("service_charge_amount", {
      mode: "bigint",
    }).notNull(),
    finalAmount: bigint("final_amount", { mode: "bigint" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_calculations_bill_owner_fk",
      columns: [table.splitBillId, table.userId],
      foreignColumns: [splitBills.id, splitBills.userId],
    }).onDelete("cascade"),
    check(
      "split_bill_calculations_version_valid",
      sql`${table.calculationVersion} > 0 and ${table.sourceRevision} >= 0`,
    ),
    check(
      "split_bill_calculations_snapshot_valid",
      sql`length(trim(${table.merchantNameSnapshot})) between 1 and 120
        and (${table.noteSnapshot} is null
          or length(trim(${table.noteSnapshot})) between 1 and 500)`,
    ),
    check(
      "split_bill_calculations_percentages_valid",
      sql`${table.discountBps} between 0 and 10000
        and ${table.billTaxBps} between 0 and 10000
        and ${table.serviceChargeBps} between 0 and 10000`,
    ),
    check(
      "split_bill_calculations_amounts_valid",
      sql`${table.fixedDiscountAmount} between 0 and 9007199254740991
        and ${table.subtotalAmount} between 0 and 9007199254740991
        and ${table.discountAmount} between 0 and 9007199254740991
        and ${table.discountedSubtotalAmount} between 0 and 9007199254740991
        and ${table.itemTaxAmount} between 0 and 9007199254740991
        and ${table.billTaxAmount} between 0 and 9007199254740991
        and ${table.totalTaxAmount} between 0 and 9007199254740991
        and ${table.serviceChargeAmount} between 0 and 9007199254740991
        and ${table.finalAmount} between 0 and 9007199254740991`,
    ),
    check(
      "split_bill_calculations_totals_valid",
      sql`${table.discountedSubtotalAmount} =
          ${table.subtotalAmount} - ${table.discountAmount}
        and ${table.totalTaxAmount} =
          ${table.itemTaxAmount} + ${table.billTaxAmount}
        and ${table.finalAmount} =
          ${table.discountedSubtotalAmount} + ${table.totalTaxAmount}
          + ${table.serviceChargeAmount}`,
    ),
    uniqueIndex("split_bill_calculations_bill_uidx").on(table.splitBillId),
    unique("split_bill_calculations_id_bill_user_uidx").on(
      table.id,
      table.splitBillId,
      table.userId,
    ),
  ],
);

export const splitBillItemResults = pgTable(
  "split_bill_item_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    calculationId: uuid("calculation_id").notNull(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    sourceItemId: uuid("source_item_id").notNull(),
    nameSnapshot: varchar("name_snapshot", { length: 120 }).notNull(),
    positionSnapshot: integer("position_snapshot").notNull(),
    quantitySnapshot: integer("quantity_snapshot").notNull(),
    unitPriceSnapshot: bigint("unit_price_snapshot", {
      mode: "bigint",
    }).notNull(),
    itemTaxBpsSnapshot: smallint("item_tax_bps_snapshot").notNull(),
    subtotalAmount: bigint("subtotal_amount", { mode: "bigint" }).notNull(),
    discountAmount: bigint("discount_amount", { mode: "bigint" }).notNull(),
    discountedAmount: bigint("discounted_amount", { mode: "bigint" }).notNull(),
    itemTaxAmount: bigint("item_tax_amount", { mode: "bigint" }).notNull(),
    billTaxAmount: bigint("bill_tax_amount", { mode: "bigint" }).notNull(),
    totalBeforeServiceAmount: bigint("total_before_service_amount", {
      mode: "bigint",
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_item_results_calculation_owner_fk",
      columns: [table.calculationId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillCalculations.id,
        splitBillCalculations.splitBillId,
        splitBillCalculations.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_item_results_source_owner_fk",
      columns: [table.sourceItemId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillItems.id,
        splitBillItems.splitBillId,
        splitBillItems.userId,
      ],
    }).onDelete("cascade"),
    check(
      "split_bill_item_results_values_valid",
      sql`${table.positionSnapshot} > 0
        and ${table.quantitySnapshot} between 1 and 10000
        and ${table.unitPriceSnapshot} between 1 and 9007199254740991
        and ${table.itemTaxBpsSnapshot} between 0 and 10000
        and ${table.subtotalAmount} between 0 and 9007199254740991
        and ${table.discountAmount} between 0 and 9007199254740991
        and ${table.discountedAmount} between 0 and 9007199254740991
        and ${table.itemTaxAmount} between 0 and 9007199254740991
        and ${table.billTaxAmount} between 0 and 9007199254740991
        and ${table.totalBeforeServiceAmount} between 0 and 9007199254740991
        and ${table.discountedAmount} =
          ${table.subtotalAmount} - ${table.discountAmount}
        and ${table.totalBeforeServiceAmount} =
          ${table.discountedAmount} + ${table.itemTaxAmount}
          + ${table.billTaxAmount}
        and (${table.itemTaxBpsSnapshot} = 0 or ${table.billTaxAmount} = 0)`,
    ),
    uniqueIndex("split_bill_item_results_calculation_item_uidx").on(
      table.calculationId,
      table.sourceItemId,
    ),
    uniqueIndex("split_bill_item_results_calculation_position_uidx").on(
      table.calculationId,
      table.positionSnapshot,
    ),
    index("split_bill_item_results_user_bill_idx").on(
      table.userId,
      table.splitBillId,
      table.positionSnapshot,
    ),
  ],
);

export const splitBillAssignmentResults = pgTable(
  "split_bill_assignment_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    calculationId: uuid("calculation_id").notNull(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    sourceAssignmentId: uuid("source_assignment_id").notNull(),
    sourceItemId: uuid("source_item_id").notNull(),
    sourceParticipantId: uuid("source_participant_id").notNull(),
    itemAmount: bigint("item_amount", { mode: "bigint" }).notNull(),
    itemTaxAmount: bigint("item_tax_amount", { mode: "bigint" }).notNull(),
    billTaxAmount: bigint("bill_tax_amount", { mode: "bigint" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_assignment_results_calculation_owner_fk",
      columns: [table.calculationId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillCalculations.id,
        splitBillCalculations.splitBillId,
        splitBillCalculations.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_assignment_results_source_owner_fk",
      columns: [table.sourceAssignmentId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillAssignments.id,
        splitBillAssignments.splitBillId,
        splitBillAssignments.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_assignment_results_item_owner_fk",
      columns: [table.sourceItemId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillItems.id,
        splitBillItems.splitBillId,
        splitBillItems.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_assignment_results_participant_owner_fk",
      columns: [table.sourceParticipantId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillParticipants.id,
        splitBillParticipants.splitBillId,
        splitBillParticipants.userId,
      ],
    }).onDelete("cascade"),
    check(
      "split_bill_assignment_results_amounts_valid",
      sql`${table.itemAmount} between 0 and 9007199254740991
        and ${table.itemTaxAmount} between 0 and 9007199254740991
        and ${table.billTaxAmount} between 0 and 9007199254740991`,
    ),
    uniqueIndex("split_bill_assignment_results_source_uidx").on(
      table.sourceAssignmentId,
    ),
    index("split_bill_assignment_results_calculation_item_idx").on(
      table.calculationId,
      table.sourceItemId,
    ),
    index("split_bill_assignment_results_calculation_participant_idx").on(
      table.calculationId,
      table.sourceParticipantId,
    ),
  ],
);

export const splitBillParticipantResults = pgTable(
  "split_bill_participant_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    calculationId: uuid("calculation_id").notNull(),
    splitBillId: uuid("split_bill_id").notNull(),
    userId: text("user_id").notNull(),
    sourceParticipantId: uuid("source_participant_id").notNull(),
    nameSnapshot: varchar("name_snapshot", { length: 100 }).notNull(),
    positionSnapshot: integer("position_snapshot").notNull(),
    itemAmount: bigint("item_amount", { mode: "bigint" }).notNull(),
    itemTaxAmount: bigint("item_tax_amount", { mode: "bigint" }).notNull(),
    billTaxAmount: bigint("bill_tax_amount", { mode: "bigint" }).notNull(),
    serviceChargeAmount: bigint("service_charge_amount", {
      mode: "bigint",
    }).notNull(),
    finalAmount: bigint("final_amount", { mode: "bigint" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "split_bill_participant_results_calculation_owner_fk",
      columns: [table.calculationId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillCalculations.id,
        splitBillCalculations.splitBillId,
        splitBillCalculations.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "split_bill_participant_results_source_owner_fk",
      columns: [table.sourceParticipantId, table.splitBillId, table.userId],
      foreignColumns: [
        splitBillParticipants.id,
        splitBillParticipants.splitBillId,
        splitBillParticipants.userId,
      ],
    }).onDelete("cascade"),
    check(
      "split_bill_participant_results_values_valid",
      sql`${table.positionSnapshot} > 0
        and ${table.itemAmount} between 0 and 9007199254740991
        and ${table.itemTaxAmount} between 0 and 9007199254740991
        and ${table.billTaxAmount} between 0 and 9007199254740991
        and ${table.serviceChargeAmount} between 0 and 9007199254740991
        and ${table.finalAmount} between 0 and 9007199254740991
        and ${table.finalAmount} =
          ${table.itemAmount} + ${table.itemTaxAmount}
          + ${table.billTaxAmount} + ${table.serviceChargeAmount}`,
    ),
    uniqueIndex("split_bill_participant_results_source_uidx").on(
      table.sourceParticipantId,
    ),
    uniqueIndex("split_bill_participant_results_calculation_position_uidx").on(
      table.calculationId,
      table.positionSnapshot,
    ),
    index("split_bill_participant_results_user_bill_idx").on(
      table.userId,
      table.splitBillId,
      table.positionSnapshot,
    ),
  ],
);

export type SplitBill = typeof splitBills.$inferSelect;
export type SplitBillParticipant = typeof splitBillParticipants.$inferSelect;
export type SplitBillItem = typeof splitBillItems.$inferSelect;
export type SplitBillAssignment = typeof splitBillAssignments.$inferSelect;
export type SplitBillCalculation = typeof splitBillCalculations.$inferSelect;
