import {
  SPLIT_BILL_CALCULATION_VERSION,
  SPLIT_BILL_MAX_ASSIGNMENTS,
  SPLIT_BILL_MAX_ITEMS,
  SPLIT_BILL_MAX_MONEY,
  SPLIT_BILL_MAX_PARTICIPANTS,
  SPLIT_BILL_MAX_QUANTITY,
} from "../constants/limits";
import type {
  CalculationItem,
  SplitBillAssignmentResult,
  SplitBillCalculationInput,
  SplitBillCalculationResult,
  SplitBillItemResult,
} from "../types/split-bill";
import {
  allocateLargestRemainder,
  calculateBasisPointAmount,
} from "./allocation";

export class SplitBillCalculationError extends Error {
  constructor(
    public readonly code:
      | "invalid"
      | "unassigned"
      | "discount_exceeds_subtotal"
      | "overflow"
      | "reconciliation",
    message: string,
  ) {
    super(message);
  }
}

function sum(values: bigint[]) {
  return values.reduce((total, value) => total + value, 0n);
}

function assertSafe(...values: bigint[]) {
  if (values.some((value) => value < 0n || value > SPLIT_BILL_MAX_MONEY)) {
    throw new SplitBillCalculationError(
      "overflow",
      "Nilai tagihan berada di luar rentang yang didukung.",
    );
  }
}

function validate(input: SplitBillCalculationInput) {
  if (
    input.participants.length < 1 ||
    input.participants.length > SPLIT_BILL_MAX_PARTICIPANTS ||
    input.items.length < 1 ||
    input.items.length > SPLIT_BILL_MAX_ITEMS
  ) {
    throw new SplitBillCalculationError(
      "invalid",
      "Jumlah peserta atau item tidak valid.",
    );
  }
  for (const bps of [
    input.discountBps,
    input.billTaxBps,
    input.serviceChargeBps,
  ]) {
    if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
      throw new SplitBillCalculationError(
        "invalid",
        "Persentase tagihan tidak valid.",
      );
    }
  }
  if (
    (input.discountMode === "none" &&
      (input.fixedDiscountAmount !== 0n || input.discountBps !== 0)) ||
    (input.discountMode === "fixed" &&
      (input.fixedDiscountAmount <= 0n || input.discountBps !== 0)) ||
    (input.discountMode === "percentage" &&
      (input.fixedDiscountAmount !== 0n ||
        input.discountBps < 1 ||
        input.discountBps > 10_000))
  ) {
    throw new SplitBillCalculationError(
      "invalid",
      "Konfigurasi diskon tidak valid.",
    );
  }

  const participantIds = new Set(input.participants.map(({ id }) => id));
  if (participantIds.size !== input.participants.length) {
    throw new SplitBillCalculationError("invalid", "Peserta tidak unik.");
  }
  const itemIds = new Set<string>();
  const assignmentIds = new Set<string>();
  let assignmentCount = 0;
  for (const item of input.items) {
    if (
      itemIds.has(item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > SPLIT_BILL_MAX_QUANTITY ||
      item.unitPrice <= 0n ||
      !Number.isInteger(item.itemTaxBps) ||
      item.itemTaxBps < 0 ||
      item.itemTaxBps > 10_000
    ) {
      throw new SplitBillCalculationError("invalid", "Item tidak valid.");
    }
    itemIds.add(item.id);
    if (item.assignments.length === 0) {
      throw new SplitBillCalculationError(
        "unassigned",
        `Item ${item.name} belum memiliki peserta.`,
      );
    }
    const itemParticipantIds = new Set<string>();
    for (const assignment of item.assignments) {
      assignmentCount += 1;
      if (
        assignmentIds.has(assignment.id) ||
        itemParticipantIds.has(assignment.participantId) ||
        !participantIds.has(assignment.participantId)
      ) {
        throw new SplitBillCalculationError(
          "invalid",
          "Penetapan peserta item tidak valid.",
        );
      }
      assignmentIds.add(assignment.id);
      itemParticipantIds.add(assignment.participantId);
    }
  }
  if (assignmentCount > SPLIT_BILL_MAX_ASSIGNMENTS) {
    throw new SplitBillCalculationError(
      "invalid",
      "Jumlah penetapan peserta terlalu banyak.",
    );
  }
}

function allocationMap(
  target: bigint,
  entries: { id: string; position: number; weight: bigint }[],
) {
  return new Map(
    allocateLargestRemainder(target, entries).map((entry) => [
      entry.id,
      entry.amount,
    ]),
  );
}

function itemAssignmentAllocation(
  item: CalculationItem,
  target: bigint,
  weights?: Map<string, bigint>,
) {
  return allocationMap(
    target,
    item.assignments.map((assignment, index) => ({
      id: assignment.id,
      position: index + 1,
      weight: weights?.get(assignment.id) ?? 1n,
    })),
  );
}

export function calculateSplitBill(
  input: SplitBillCalculationInput,
): SplitBillCalculationResult {
  validate(input);
  const participants = [...input.participants].sort(
    (left, right) =>
      left.position - right.position || left.id.localeCompare(right.id),
  );
  const participantPosition = new Map(
    participants.map((participant) => [participant.id, participant.position]),
  );
  const items = [...input.items].sort(
    (left, right) =>
      left.position - right.position || left.id.localeCompare(right.id),
  );
  const subtotals = new Map<string, bigint>();
  for (const item of items) {
    const subtotal = BigInt(item.quantity) * item.unitPrice;
    assertSafe(item.unitPrice, subtotal);
    subtotals.set(item.id, subtotal);
  }
  const subtotalAmount = sum([...subtotals.values()]);
  assertSafe(subtotalAmount);
  if (subtotalAmount === 0n) {
    throw new SplitBillCalculationError(
      "invalid",
      "Tagihan tanpa subtotal tidak dapat dihitung.",
    );
  }

  const discountAmount =
    input.discountMode === "none"
      ? 0n
      : input.discountMode === "fixed"
        ? input.fixedDiscountAmount
        : calculateBasisPointAmount(subtotalAmount, input.discountBps);
  if (discountAmount > subtotalAmount) {
    throw new SplitBillCalculationError(
      "discount_exceeds_subtotal",
      "Diskon tidak boleh melebihi subtotal.",
    );
  }
  assertSafe(discountAmount);
  const itemDiscounts = allocationMap(
    discountAmount,
    items.map((item) => ({
      id: item.id,
      position: item.position,
      weight: subtotals.get(item.id)!,
    })),
  );

  const assignmentResults = new Map<string, SplitBillAssignmentResult>();
  const itemResults = new Map<string, SplitBillItemResult>();
  for (const item of items) {
    const subtotal = subtotals.get(item.id)!;
    const discount = itemDiscounts.get(item.id)!;
    const discounted = subtotal - discount;
    const itemShares = itemAssignmentAllocation(item, discounted);
    for (const assignment of item.assignments) {
      assignmentResults.set(assignment.id, {
        assignmentId: assignment.id,
        itemId: item.id,
        participantId: assignment.participantId,
        itemAmount: itemShares.get(assignment.id)!,
        itemTaxAmount: 0n,
        billTaxAmount: 0n,
      });
    }
    itemResults.set(item.id, {
      itemId: item.id,
      name: item.name,
      position: item.position,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTaxBps: item.itemTaxBps,
      subtotalAmount: subtotal,
      discountAmount: discount,
      discountedAmount: discounted,
      itemTaxAmount: 0n,
      billTaxAmount: 0n,
      totalBeforeServiceAmount: 0n,
    });
  }

  for (const item of items.filter(({ itemTaxBps }) => itemTaxBps > 0)) {
    const itemResult = itemResults.get(item.id)!;
    const itemTax = calculateBasisPointAmount(
      itemResult.discountedAmount,
      item.itemTaxBps,
    );
    const shareWeights = new Map(
      item.assignments.map(({ id }) => [
        id,
        assignmentResults.get(id)!.itemAmount,
      ]),
    );
    const taxShares =
      itemTax === 0n
        ? new Map(item.assignments.map(({ id }) => [id, 0n]))
        : itemAssignmentAllocation(item, itemTax, shareWeights);
    itemResult.itemTaxAmount = itemTax;
    for (const assignment of item.assignments) {
      assignmentResults.get(assignment.id)!.itemTaxAmount =
        taxShares.get(assignment.id)!;
    }
  }

  const billTaxEligible = items.filter(({ itemTaxBps }) => itemTaxBps === 0);
  const billTaxBase = sum(
    billTaxEligible.map((item) => itemResults.get(item.id)!.discountedAmount),
  );
  const billTaxAmount = calculateBasisPointAmount(
    billTaxBase,
    input.billTaxBps,
  );
  const billTaxByItem =
    billTaxEligible.length === 0
      ? new Map<string, bigint>()
      : allocationMap(
          billTaxAmount,
          billTaxEligible.map((item) => ({
            id: item.id,
            position: item.position,
            weight: itemResults.get(item.id)!.discountedAmount,
          })),
        );
  for (const item of billTaxEligible) {
    const itemBillTax = billTaxByItem.get(item.id) ?? 0n;
    const itemResult = itemResults.get(item.id)!;
    itemResult.billTaxAmount = itemBillTax;
    const shareWeights = new Map(
      item.assignments.map(({ id }) => [
        id,
        assignmentResults.get(id)!.itemAmount,
      ]),
    );
    const taxShares =
      itemBillTax === 0n
        ? new Map(item.assignments.map(({ id }) => [id, 0n]))
        : itemAssignmentAllocation(item, itemBillTax, shareWeights);
    for (const assignment of item.assignments) {
      assignmentResults.get(assignment.id)!.billTaxAmount =
        taxShares.get(assignment.id)!;
    }
  }

  const finalizedItems = items.map((item) => {
    const result = itemResults.get(item.id)!;
    result.totalBeforeServiceAmount =
      result.discountedAmount + result.itemTaxAmount + result.billTaxAmount;
    assertSafe(
      result.subtotalAmount,
      result.discountAmount,
      result.discountedAmount,
      result.itemTaxAmount,
      result.billTaxAmount,
      result.totalBeforeServiceAmount,
    );
    return result;
  });
  const finalizedAssignments = items.flatMap((item) =>
    item.assignments.map((assignment) => assignmentResults.get(assignment.id)!),
  );
  const participantBase = new Map(
    participants.map((participant) => [
      participant.id,
      {
        participant,
        itemAmount: 0n,
        itemTaxAmount: 0n,
        billTaxAmount: 0n,
      },
    ]),
  );
  for (const assignment of finalizedAssignments) {
    const value = participantBase.get(assignment.participantId)!;
    value.itemAmount += assignment.itemAmount;
    value.itemTaxAmount += assignment.itemTaxAmount;
    value.billTaxAmount += assignment.billTaxAmount;
  }

  const discountedSubtotalAmount = subtotalAmount - discountAmount;
  const serviceChargeAmount = calculateBasisPointAmount(
    discountedSubtotalAmount,
    input.serviceChargeBps,
  );
  const serviceByParticipant =
    serviceChargeAmount === 0n
      ? new Map(participants.map(({ id }) => [id, 0n]))
      : allocationMap(
          serviceChargeAmount,
          participants.map((participant) => ({
            id: participant.id,
            position: participantPosition.get(participant.id)!,
            weight: participantBase.get(participant.id)!.itemAmount,
          })),
        );
  const participantResults = participants.map((participant) => {
    const base = participantBase.get(participant.id)!;
    const service = serviceByParticipant.get(participant.id)!;
    const final =
      base.itemAmount + base.itemTaxAmount + base.billTaxAmount + service;
    assertSafe(
      base.itemAmount,
      base.itemTaxAmount,
      base.billTaxAmount,
      service,
      final,
    );
    return {
      participantId: participant.id,
      name: participant.name,
      position: participant.position,
      itemAmount: base.itemAmount,
      itemTaxAmount: base.itemTaxAmount,
      billTaxAmount: base.billTaxAmount,
      serviceChargeAmount: service,
      finalAmount: final,
    };
  });

  const itemTaxAmount = sum(finalizedItems.map((item) => item.itemTaxAmount));
  const totalTaxAmount = itemTaxAmount + billTaxAmount;
  const finalAmount =
    discountedSubtotalAmount + totalTaxAmount + serviceChargeAmount;
  assertSafe(
    discountedSubtotalAmount,
    itemTaxAmount,
    billTaxAmount,
    totalTaxAmount,
    serviceChargeAmount,
    finalAmount,
  );

  const invariant =
    sum(finalizedItems.map((item) => item.subtotalAmount)) === subtotalAmount &&
    sum(finalizedItems.map((item) => item.discountAmount)) === discountAmount &&
    sum(finalizedItems.map((item) => item.discountedAmount)) ===
      discountedSubtotalAmount &&
    sum(finalizedAssignments.map((item) => item.itemAmount)) ===
      discountedSubtotalAmount &&
    sum(finalizedAssignments.map((item) => item.itemTaxAmount)) ===
      itemTaxAmount &&
    sum(finalizedAssignments.map((item) => item.billTaxAmount)) ===
      billTaxAmount &&
    sum(participantResults.map((item) => item.itemAmount)) ===
      discountedSubtotalAmount &&
    sum(participantResults.map((item) => item.itemTaxAmount)) ===
      itemTaxAmount &&
    sum(participantResults.map((item) => item.billTaxAmount)) ===
      billTaxAmount &&
    sum(participantResults.map((item) => item.serviceChargeAmount)) ===
      serviceChargeAmount &&
    sum(participantResults.map((item) => item.finalAmount)) === finalAmount;
  if (!invariant) {
    throw new SplitBillCalculationError(
      "reconciliation",
      "Kalkulasi tagihan tidak dapat direkonsiliasi.",
    );
  }

  return {
    calculationVersion: SPLIT_BILL_CALCULATION_VERSION,
    subtotalAmount,
    discountAmount,
    discountedSubtotalAmount,
    itemTaxAmount,
    billTaxAmount,
    totalTaxAmount,
    serviceChargeAmount,
    finalAmount,
    items: finalizedItems,
    assignments: finalizedAssignments,
    participants: participantResults,
  };
}
