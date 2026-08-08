import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import type { Database } from "@/db/types";
import type { SplitBillDraftData } from "../schemas/split-bill";

export type PreparedSplitBillDraft = {
  merchantName: string;
  billDate: string;
  note: string | null;
  discountMode: "none" | "fixed" | "percentage";
  fixedDiscountAmount: bigint;
  discountBps: number;
  billTaxBps: number;
  serviceChargeBps: number;
  participants: { id: string; name: string; position: number }[];
  items: {
    id: string;
    name: string;
    position: number;
    quantity: number;
    unitPrice: bigint;
    itemTaxBps: number;
  }[];
  assignments: {
    id: string;
    itemId: string;
    participantId: string;
  }[];
};

export function prepareSplitBillDraft(
  input: SplitBillDraftData,
): PreparedSplitBillDraft {
  const participantIds = new Map(
    input.participants.map((participant) => [participant.id, randomUUID()]),
  );
  const itemIds = new Map(input.items.map((item) => [item.id, randomUUID()]));
  return {
    merchantName: input.merchantName,
    billDate: input.billDate,
    note: input.note,
    discountMode: input.discountMode,
    fixedDiscountAmount: BigInt(input.fixedDiscountAmount),
    discountBps: input.discountBps,
    billTaxBps: input.billTaxBps,
    serviceChargeBps: input.serviceChargeBps,
    participants: input.participants.map((participant, index) => ({
      id: participantIds.get(participant.id)!,
      name: participant.name,
      position: index + 1,
    })),
    items: input.items.map((item, index) => ({
      id: itemIds.get(item.id)!,
      name: item.name,
      position: index + 1,
      quantity: item.quantity,
      unitPrice: BigInt(item.unitPrice),
      itemTaxBps: item.itemTaxBps,
    })),
    assignments: input.items.flatMap((item) =>
      item.participantIds.map((participantId) => ({
        id: randomUUID(),
        itemId: itemIds.get(item.id)!,
        participantId: participantIds.get(participantId)!,
      })),
    ),
  };
}

function participantJson(input: PreparedSplitBillDraft) {
  return JSON.stringify(input.participants);
}

function itemJson(input: PreparedSplitBillDraft) {
  return JSON.stringify(
    input.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
    })),
  );
}

function assignmentJson(input: PreparedSplitBillDraft) {
  return JSON.stringify(input.assignments);
}

type ReturnedBill = { id: string; revision: number };

export async function createOwnedSplitBillDraft(
  database: Database,
  userId: string,
  input: PreparedSplitBillDraft,
) {
  const billId = randomUUID();
  const result = await database.execute<ReturnedBill>(sql`
    with inserted_bill as (
      insert into split_bills (
        id, user_id, merchant_name, bill_date, note, status,
        discount_mode, fixed_discount_amount, discount_bps,
        bill_tax_bps, service_charge_bps, revision
      )
      values (
        ${billId}::uuid, ${userId}, ${input.merchantName},
        ${input.billDate}::date, ${input.note}, 'draft',
        ${input.discountMode}::split_bill_discount_mode,
        ${input.fixedDiscountAmount}::bigint, ${input.discountBps},
        ${input.billTaxBps}, ${input.serviceChargeBps}, 0
      )
      returning id, user_id, revision
    ),
    participant_rows as (
      select *
      from jsonb_to_recordset(${participantJson(input)}::jsonb)
        as row(id uuid, name text, position integer)
    ),
    inserted_participants as (
      insert into split_bill_participants (
        id, split_bill_id, user_id, name, position
      )
      select row.id, bill.id, bill.user_id, row.name, row.position
      from participant_rows as row
      cross join inserted_bill as bill
      returning id
    ),
    item_rows as (
      select *
      from jsonb_to_recordset(${itemJson(input)}::jsonb)
        as row(
          id uuid, name text, position integer, quantity integer,
          "unitPrice" text, "itemTaxBps" integer
        )
    ),
    inserted_items as (
      insert into split_bill_items (
        id, split_bill_id, user_id, name, position,
        quantity, unit_price, item_tax_bps
      )
      select
        row.id, bill.id, bill.user_id, row.name, row.position,
        row.quantity, row."unitPrice"::bigint, row."itemTaxBps"
      from item_rows as row
      cross join inserted_bill as bill
      cross join (
        select count(*) as count from inserted_participants
      ) as participant_guard
      where participant_guard.count = ${input.participants.length}
      returning id
    ),
    assignment_rows as (
      select *
      from jsonb_to_recordset(${assignmentJson(input)}::jsonb)
        as row(id uuid, "itemId" uuid, "participantId" uuid)
    ),
    inserted_assignments as (
      insert into split_bill_assignments (
        id, split_bill_id, user_id, item_id, participant_id
      )
      select
        row.id, bill.id, bill.user_id, row."itemId", row."participantId"
      from assignment_rows as row
      cross join inserted_bill as bill
      cross join (
        select count(*) as count from inserted_items
      ) as item_guard
      where item_guard.count = ${input.items.length}
      returning id
    )
    select bill.id, bill.revision
    from inserted_bill as bill
    cross join (
      select count(*) as count from inserted_assignments
    ) as assignment_guard
    where assignment_guard.count = ${input.assignments.length}
  `);
  return result.rows[0] ?? null;
}

export async function replaceOwnedSplitBillDraft(
  database: Database,
  userId: string,
  billId: string,
  expectedRevision: number,
  input: PreparedSplitBillDraft,
) {
  const result = await database.execute<ReturnedBill>(sql`
    with eligible as (
      select id, user_id
      from split_bills
      where id = ${billId}::uuid
        and user_id = ${userId}
        and status = 'draft'
        and revision = ${expectedRevision}
      for update
    ),
    deleted_assignments as (
      delete from split_bill_assignments as assignment
      using eligible
      where assignment.split_bill_id = eligible.id
        and assignment.user_id = eligible.user_id
      returning assignment.id
    ),
    deleted_items as (
      delete from split_bill_items as item
      using eligible
      where item.split_bill_id = eligible.id
        and item.user_id = eligible.user_id
        and (select count(*) from deleted_assignments) >= 0
      returning item.id
    ),
    deleted_participants as (
      delete from split_bill_participants as participant
      using eligible
      where participant.split_bill_id = eligible.id
        and participant.user_id = eligible.user_id
        and (select count(*) from deleted_items) >= 0
      returning participant.id
    ),
    participant_rows as (
      select *
      from jsonb_to_recordset(${participantJson(input)}::jsonb)
        as row(id uuid, name text, position integer)
    ),
    inserted_participants as (
      insert into split_bill_participants (
        id, split_bill_id, user_id, name, position
      )
      select row.id, bill.id, bill.user_id, row.name, row.position
      from participant_rows as row
      cross join eligible as bill
      cross join (
        select count(*) as count from deleted_participants
      ) as delete_guard
      returning id
    ),
    item_rows as (
      select *
      from jsonb_to_recordset(${itemJson(input)}::jsonb)
        as row(
          id uuid, name text, position integer, quantity integer,
          "unitPrice" text, "itemTaxBps" integer
        )
    ),
    inserted_items as (
      insert into split_bill_items (
        id, split_bill_id, user_id, name, position,
        quantity, unit_price, item_tax_bps
      )
      select
        row.id, bill.id, bill.user_id, row.name, row.position,
        row.quantity, row."unitPrice"::bigint, row."itemTaxBps"
      from item_rows as row
      cross join eligible as bill
      cross join (
        select count(*) as count from inserted_participants
      ) as participant_guard
      where participant_guard.count = ${input.participants.length}
      returning id
    ),
    assignment_rows as (
      select *
      from jsonb_to_recordset(${assignmentJson(input)}::jsonb)
        as row(id uuid, "itemId" uuid, "participantId" uuid)
    ),
    inserted_assignments as (
      insert into split_bill_assignments (
        id, split_bill_id, user_id, item_id, participant_id
      )
      select
        row.id, bill.id, bill.user_id, row."itemId", row."participantId"
      from assignment_rows as row
      cross join eligible as bill
      cross join (
        select count(*) as count from inserted_items
      ) as item_guard
      where item_guard.count = ${input.items.length}
      returning id
    ),
    updated as (
      update split_bills as bill
      set
        merchant_name = ${input.merchantName},
        bill_date = ${input.billDate}::date,
        note = ${input.note},
        discount_mode = ${input.discountMode}::split_bill_discount_mode,
        fixed_discount_amount = ${input.fixedDiscountAmount}::bigint,
        discount_bps = ${input.discountBps},
        bill_tax_bps = ${input.billTaxBps},
        service_charge_bps = ${input.serviceChargeBps},
        revision = bill.revision + 1,
        updated_at = now()
      from eligible
      cross join (
        select count(*) as count from inserted_assignments
      ) as assignment_guard
      where bill.id = eligible.id
        and bill.user_id = eligible.user_id
        and assignment_guard.count = ${input.assignments.length}
      returning bill.id, bill.revision
    )
    select id, revision from updated
  `);
  return result.rows[0] ?? null;
}

export async function deleteOwnedSplitBillDraft(
  database: Database,
  userId: string,
  billId: string,
) {
  const result = await database.execute<{ id: string }>(sql`
    delete from split_bills
    where id = ${billId}::uuid
      and user_id = ${userId}
      and status = 'draft'
    returning id
  `);
  return result.rows[0] ?? null;
}

export async function deleteOwnedSplitBill(
  database: Database,
  userId: string,
  billId: string,
) {
  const result = await database.execute<{ id: string }>(sql`
    delete from split_bills
    where id = ${billId}::uuid
      and user_id = ${userId}
    returning id
  `);
  return result.rows[0] ?? null;
}

export async function archiveOwnedSplitBill(
  database: Database,
  userId: string,
  billId: string,
) {
  const result = await database.execute<{ id: string }>(sql`
    update split_bills
    set status = 'archived',
        archived_at = now(),
        revision = revision + 1,
        updated_at = now()
    where id = ${billId}::uuid
      and user_id = ${userId}
      and status = 'finalized'
    returning id
  `);
  return result.rows[0] ?? null;
}
