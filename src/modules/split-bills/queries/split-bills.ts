import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import {
  splitBillAssignmentResults,
  splitBillAssignments,
  splitBillCalculations,
  splitBillItemResults,
  splitBillItems,
  splitBillParticipantResults,
  splitBillParticipants,
  splitBills,
} from "@/db/schema";
import type { Database } from "@/db/types";
import type { SplitBillFilters } from "../schemas/split-bill-filters";

function monthEnd(month: string) {
  const [year, number] = month.split("-").map(Number);
  const nextYear = number === 12 ? year + 1 : year;
  const nextMonth = number === 12 ? 1 : number + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

function splitBillOrder(filters: SplitBillFilters) {
  const direction = filters.direction === "asc" ? asc : desc;
  const primary =
    filters.sort === "amount"
      ? direction(splitBillCalculations.finalAmount)
      : direction(splitBills.billDate);
  const tieBreaker = direction(splitBills.id);
  return [primary, tieBreaker];
}

function historyConditions(userId: string, filters: SplitBillFilters) {
  const result: SQL[] = [eq(splitBills.userId, userId)];
  if (filters.status && filters.status !== "all") {
    result.push(eq(splitBills.status, filters.status));
  } else if (!filters.status) {
    result.push(inArray(splitBills.status, ["draft", "finalized"]));
  }
  if (filters.month) {
    result.push(
      gte(splitBills.billDate, `${filters.month}-01`),
      lt(splitBills.billDate, monthEnd(filters.month)),
    );
  }
  if (filters.q) {
    const literal = filters.q.replace(/[\\%_]/gu, "\\$&");
    result.push(ilike(splitBills.merchantName, `%${literal}%`));
  }
  return result;
}

export async function listOwnedSplitBills(
  userId: string,
  filters: SplitBillFilters,
  database: Database = db,
) {
  const where = and(...historyConditions(userId, filters));
  const [rows, totalRows] = await Promise.all([
    database
      .select({
        id: splitBills.id,
        merchantName: splitBills.merchantName,
        billDate: splitBills.billDate,
        status: splitBills.status,
        revision: splitBills.revision,
        createdAt: splitBills.createdAt,
        finalAmount: splitBillCalculations.finalAmount,
        participantCount: count(splitBillParticipants.id),
      })
      .from(splitBills)
      .leftJoin(
        splitBillCalculations,
        and(
          eq(splitBillCalculations.splitBillId, splitBills.id),
          eq(splitBillCalculations.userId, userId),
        ),
      )
      .leftJoin(
        splitBillParticipants,
        and(
          eq(splitBillParticipants.splitBillId, splitBills.id),
          eq(splitBillParticipants.userId, userId),
        ),
      )
      .where(where)
      .groupBy(splitBills.id, splitBillCalculations.finalAmount)
      .orderBy(...splitBillOrder(filters))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize),
    database.select({ value: count() }).from(splitBills).where(where),
  ]);
  const total = totalRows[0]?.value ?? 0;
  return {
    rows: rows.map((row) => ({
      ...row,
      finalAmount: row.finalAmount?.toString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getOwnedSplitBillSource(
  userId: string,
  billId: string,
  database: Database = db,
) {
  const [billRows, participants, items, assignments] = await Promise.all([
    database
      .select()
      .from(splitBills)
      .where(and(eq(splitBills.id, billId), eq(splitBills.userId, userId)))
      .limit(1),
    database
      .select()
      .from(splitBillParticipants)
      .where(
        and(
          eq(splitBillParticipants.splitBillId, billId),
          eq(splitBillParticipants.userId, userId),
        ),
      )
      .orderBy(asc(splitBillParticipants.position)),
    database
      .select()
      .from(splitBillItems)
      .where(
        and(
          eq(splitBillItems.splitBillId, billId),
          eq(splitBillItems.userId, userId),
        ),
      )
      .orderBy(asc(splitBillItems.position)),
    database
      .select()
      .from(splitBillAssignments)
      .where(
        and(
          eq(splitBillAssignments.splitBillId, billId),
          eq(splitBillAssignments.userId, userId),
        ),
      ),
  ]);
  const bill = billRows[0];
  if (!bill) return null;
  return { bill, participants, items, assignments };
}

export async function getOwnedSplitBillDetail(
  userId: string,
  billId: string,
  database: Database = db,
) {
  const source = await getOwnedSplitBillSource(userId, billId, database);
  if (!source) return null;
  const [calculationRows, itemResults, assignmentResults, participantResults] =
    await Promise.all([
      database
        .select()
        .from(splitBillCalculations)
        .where(
          and(
            eq(splitBillCalculations.splitBillId, billId),
            eq(splitBillCalculations.userId, userId),
          ),
        )
        .limit(1),
      database
        .select()
        .from(splitBillItemResults)
        .where(
          and(
            eq(splitBillItemResults.splitBillId, billId),
            eq(splitBillItemResults.userId, userId),
          ),
        )
        .orderBy(asc(splitBillItemResults.positionSnapshot)),
      database
        .select()
        .from(splitBillAssignmentResults)
        .where(
          and(
            eq(splitBillAssignmentResults.splitBillId, billId),
            eq(splitBillAssignmentResults.userId, userId),
          ),
        ),
      database
        .select()
        .from(splitBillParticipantResults)
        .where(
          and(
            eq(splitBillParticipantResults.splitBillId, billId),
            eq(splitBillParticipantResults.userId, userId),
          ),
        )
        .orderBy(asc(splitBillParticipantResults.positionSnapshot)),
    ]);
  return {
    ...source,
    calculation: calculationRows[0] ?? null,
    itemResults,
    assignmentResults,
    participantResults,
  };
}

export function serializeOwnedSplitBillSource(
  source: NonNullable<Awaited<ReturnType<typeof getOwnedSplitBillSource>>>,
) {
  return {
    id: source.bill.id,
    revision: source.bill.revision,
    status: source.bill.status,
    merchantName: source.bill.merchantName,
    billDate: source.bill.billDate,
    note: source.bill.note ?? "",
    discountMode: source.bill.discountMode,
    fixedDiscountAmount: source.bill.fixedDiscountAmount.toString(),
    discountBps: source.bill.discountBps,
    billTaxBps: source.bill.billTaxBps,
    serviceChargeBps: source.bill.serviceChargeBps,
    participants: source.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      paymentStatus: participant.paymentStatus,
      paidAmount: participant.paidAmount.toString(),
    })),
    items: source.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      itemTaxBps: item.itemTaxBps,
      participantIds: source.assignments
        .filter((assignment) => assignment.itemId === item.id)
        .map((assignment) => assignment.participantId),
    })),
  };
}
