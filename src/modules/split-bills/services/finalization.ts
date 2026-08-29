import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { hasPostgresErrorCode } from "@/db/errors";
import type { Database } from "@/db/types";
import { getOwnedSplitBillSource } from "../queries/split-bills";
import type { SplitBillCalculationInput } from "../types/split-bill";
import { calculateSplitBill } from "./calculator";

function inputFromSource(
  source: NonNullable<Awaited<ReturnType<typeof getOwnedSplitBillSource>>>,
): SplitBillCalculationInput {
  return {
    discountMode: source.bill.discountMode,
    fixedDiscountAmount: source.bill.fixedDiscountAmount,
    discountBps: source.bill.discountBps,
    billTaxMode: source.bill.billTaxMode,
    fixedBillTaxAmount: source.bill.fixedBillTaxAmount,
    billTaxBps: source.bill.billTaxBps,
    serviceChargeBps: source.bill.serviceChargeBps,
    participants: source.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      position: participant.position,
    })),
    items: source.items.map((item) => ({
      id: item.id,
      name: item.name,
      position: item.position,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTaxBps: item.itemTaxBps,
      assignments: source.assignments
        .filter((assignment) => assignment.itemId === item.id)
        .map((assignment) => ({
          id: assignment.id,
          participantId: assignment.participantId,
        })),
    })),
  };
}

function stringifyMoneyRows(
  rows: Record<string, string | number | bigint | null>[],
) {
  return JSON.stringify(
    rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "bigint" ? value.toString() : value,
        ]),
      ),
    ),
  );
}

export async function finalizeOwnedSplitBill(
  database: Database,
  userId: string,
  billId: string,
  expectedRevision: number,
) {
  const source = await getOwnedSplitBillSource(userId, billId, database);
  if (
    !source ||
    source.bill.status !== "draft" ||
    source.bill.revision !== expectedRevision
  ) {
    return { ok: false as const, reason: "unavailable" as const };
  }
  const calculated = calculateSplitBill(inputFromSource(source));
  const calculationId = randomUUID();
  const itemRows = stringifyMoneyRows(
    calculated.items.map((item) => ({
      id: randomUUID(),
      sourceItemId: item.itemId,
      name: item.name,
      position: item.position,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTaxBps: item.itemTaxBps,
      subtotal: item.subtotalAmount,
      discount: item.discountAmount,
      discounted: item.discountedAmount,
      itemTax: item.itemTaxAmount,
      billTax: item.billTaxAmount,
      total: item.totalBeforeServiceAmount,
    })),
  );
  const assignmentRows = stringifyMoneyRows(
    calculated.assignments.map((assignment) => ({
      id: randomUUID(),
      sourceAssignmentId: assignment.assignmentId,
      sourceItemId: assignment.itemId,
      sourceParticipantId: assignment.participantId,
      itemAmount: assignment.itemAmount,
      itemTaxAmount: assignment.itemTaxAmount,
      billTaxAmount: assignment.billTaxAmount,
    })),
  );
  const participantRows = stringifyMoneyRows(
    calculated.participants.map((participant) => ({
      id: randomUUID(),
      sourceParticipantId: participant.participantId,
      name: participant.name,
      position: participant.position,
      itemAmount: participant.itemAmount,
      itemTaxAmount: participant.itemTaxAmount,
      billTaxAmount: participant.billTaxAmount,
      serviceChargeAmount: participant.serviceChargeAmount,
      finalAmount: participant.finalAmount,
    })),
  );

  try {
    const result = await database.execute<{ id: string }>(sql`
    with eligible as (
      select bill.*
      from split_bills as bill
      where bill.id = ${billId}::uuid
        and bill.user_id = ${userId}
        and bill.status = 'draft'
        and bill.revision = ${expectedRevision}
        and (select count(*) from split_bill_participants
          where split_bill_id = bill.id and user_id = bill.user_id)
          = ${source.participants.length}
        and (select count(*) from split_bill_items
          where split_bill_id = bill.id and user_id = bill.user_id)
          = ${source.items.length}
        and (select count(*) from split_bill_assignments
          where split_bill_id = bill.id and user_id = bill.user_id)
          = ${source.assignments.length}
        and not exists (
          select 1
          from split_bill_items as item
          where item.split_bill_id = bill.id
            and item.user_id = bill.user_id
            and not exists (
              select 1
              from split_bill_assignments as assignment
              where assignment.item_id = item.id
                and assignment.split_bill_id = bill.id
                and assignment.user_id = bill.user_id
            )
        )
      for update
    ),
    inserted_calculation as (
      insert into split_bill_calculations (
        id, split_bill_id, user_id, calculation_version, source_revision,
        merchant_name_snapshot, bill_date_snapshot, note_snapshot,
        discount_mode, fixed_discount_amount, discount_bps,
        bill_tax_mode, fixed_bill_tax_amount, bill_tax_bps,
        service_charge_bps, subtotal_amount, discount_amount,
        discounted_subtotal_amount, item_tax_amount, bill_tax_amount,
        total_tax_amount, service_charge_amount, final_amount
      )
      select
        ${calculationId}::uuid, bill.id, bill.user_id,
        ${calculated.calculationVersion}, bill.revision,
        bill.merchant_name, bill.bill_date, bill.note,
        bill.discount_mode, bill.fixed_discount_amount, bill.discount_bps,
        bill.bill_tax_mode, bill.fixed_bill_tax_amount, bill.bill_tax_bps,
        bill.service_charge_bps,
        ${calculated.subtotalAmount}::bigint,
        ${calculated.discountAmount}::bigint,
        ${calculated.discountedSubtotalAmount}::bigint,
        ${calculated.itemTaxAmount}::bigint,
        ${calculated.billTaxAmount}::bigint,
        ${calculated.totalTaxAmount}::bigint,
        ${calculated.serviceChargeAmount}::bigint,
        ${calculated.finalAmount}::bigint
      from eligible as bill
      returning id, split_bill_id, user_id
    ),
    item_rows as (
      select *
      from jsonb_to_recordset(${itemRows}::jsonb)
        as row(
          id uuid, "sourceItemId" uuid, name text, position integer,
          quantity integer, "unitPrice" text, "itemTaxBps" integer,
          subtotal text, discount text, discounted text,
          "itemTax" text, "billTax" text, total text
        )
    ),
    inserted_items as (
      insert into split_bill_item_results (
        id, calculation_id, split_bill_id, user_id, source_item_id,
        name_snapshot, position_snapshot, quantity_snapshot,
        unit_price_snapshot, item_tax_bps_snapshot, subtotal_amount,
        discount_amount, discounted_amount, item_tax_amount,
        bill_tax_amount, total_before_service_amount
      )
      select
        row.id, calculation.id, calculation.split_bill_id,
        calculation.user_id, row."sourceItemId", row.name, row.position,
        row.quantity, row."unitPrice"::bigint, row."itemTaxBps",
        row.subtotal::bigint, row.discount::bigint, row.discounted::bigint,
        row."itemTax"::bigint, row."billTax"::bigint, row.total::bigint
      from item_rows as row
      cross join inserted_calculation as calculation
      returning id
    ),
    assignment_rows as (
      select *
      from jsonb_to_recordset(${assignmentRows}::jsonb)
        as row(
          id uuid, "sourceAssignmentId" uuid, "sourceItemId" uuid,
          "sourceParticipantId" uuid, "itemAmount" text,
          "itemTaxAmount" text, "billTaxAmount" text
        )
    ),
    inserted_assignments as (
      insert into split_bill_assignment_results (
        id, calculation_id, split_bill_id, user_id, source_assignment_id,
        source_item_id, source_participant_id, item_amount,
        item_tax_amount, bill_tax_amount
      )
      select
        row.id, calculation.id, calculation.split_bill_id,
        calculation.user_id, row."sourceAssignmentId", row."sourceItemId",
        row."sourceParticipantId", row."itemAmount"::bigint,
        row."itemTaxAmount"::bigint, row."billTaxAmount"::bigint
      from assignment_rows as row
      cross join inserted_calculation as calculation
      cross join (select count(*) as count from inserted_items) as item_guard
      where item_guard.count = ${calculated.items.length}
      returning id
    ),
    participant_rows as (
      select *
      from jsonb_to_recordset(${participantRows}::jsonb)
        as row(
          id uuid, "sourceParticipantId" uuid, name text, position integer,
          "itemAmount" text, "itemTaxAmount" text, "billTaxAmount" text,
          "serviceChargeAmount" text, "finalAmount" text
        )
    ),
    inserted_participants as (
      insert into split_bill_participant_results (
        id, calculation_id, split_bill_id, user_id, source_participant_id,
        name_snapshot, position_snapshot, item_amount, item_tax_amount,
        bill_tax_amount, service_charge_amount, final_amount
      )
      select
        row.id, calculation.id, calculation.split_bill_id,
        calculation.user_id, row."sourceParticipantId", row.name, row.position,
        row."itemAmount"::bigint, row."itemTaxAmount"::bigint,
        row."billTaxAmount"::bigint, row."serviceChargeAmount"::bigint,
        row."finalAmount"::bigint
      from participant_rows as row
      cross join inserted_calculation as calculation
      cross join (
        select count(*) as count from inserted_assignments
      ) as assignment_guard
      where assignment_guard.count = ${calculated.assignments.length}
      returning id, source_participant_id, final_amount
    ),
    initialized_payment as (
      update split_bill_participants as participant
      set
        payment_status = case
          when result.final_amount = 0 then 'paid'::split_bill_payment_status
          else 'unpaid'::split_bill_payment_status
        end,
        paid_amount = 0,
        updated_at = now()
      from inserted_participants as result
      cross join inserted_calculation as calculation
      cross join (
        select count(*) as count from inserted_participants
      ) as participant_guard
      where participant.id = result.source_participant_id
        and participant.split_bill_id = calculation.split_bill_id
        and participant.user_id = calculation.user_id
        and participant_guard.count = ${calculated.participants.length}
      returning participant.id
    ),
    finalized as (
      update split_bills as bill
      set
        status = 'finalized',
        finalized_at = now(),
        revision = bill.revision + 1,
        updated_at = now()
      from inserted_calculation as calculation
      cross join (
        select count(*) as count from initialized_payment
      ) as participant_guard
      where bill.id = calculation.split_bill_id
        and bill.user_id = calculation.user_id
        and participant_guard.count = ${calculated.participants.length}
      returning bill.id
    )
    select id from finalized
    `);
    return result.rows[0]
      ? { ok: true as const, id: result.rows[0].id }
      : { ok: false as const, reason: "conflict" as const };
  } catch (error) {
    if (hasPostgresErrorCode(error, "23505")) {
      return { ok: false as const, reason: "conflict" as const };
    }
    throw error;
  }
}
