import { describe, expect, it } from "vitest";
import type { SplitBillCalculationInput } from "../types/split-bill";
import {
  calculateSplitBill,
  SplitBillCalculationError,
} from "./calculator";

const p1 = "00000000-0000-4000-8000-000000000001";
const p2 = "00000000-0000-4000-8000-000000000002";
const p3 = "00000000-0000-4000-8000-000000000003";
const i1 = "10000000-0000-4000-8000-000000000001";
const i2 = "10000000-0000-4000-8000-000000000002";
const a1 = "20000000-0000-4000-8000-000000000001";
const a2 = "20000000-0000-4000-8000-000000000002";
const a3 = "20000000-0000-4000-8000-000000000003";

function base(): SplitBillCalculationInput {
  return {
    discountMode: "none",
    fixedDiscountAmount: 0n,
    discountBps: 0,
    billTaxMode: "percentage",
    fixedBillTaxAmount: 0n,
    billTaxBps: 0,
    serviceChargeBps: 0,
    participants: [{ id: p1, name: "Ayu", position: 1 }],
    items: [
      {
        id: i1,
        name: "Nasi",
        position: 1,
        quantity: 1,
        unitPrice: 10_000n,
        itemTaxBps: 0,
        assignments: [{ id: a1, participantId: p1 }],
      },
    ],
  };
}

describe("split-bill calculator", () => {
  it("calculates one participant and one item", () => {
    const result = calculateSplitBill(base());
    expect(result.subtotalAmount).toBe(10_000n);
    expect(result.participants[0]?.finalAmount).toBe(10_000n);
    expect(result.finalAmount).toBe(10_000n);
  });

  it("shares one item equally and deterministically", () => {
    const input = base();
    input.participants = [
      { id: p1, name: "Ayu", position: 1 },
      { id: p2, name: "Bima", position: 2 },
      { id: p3, name: "Cici", position: 3 },
    ];
    input.items[0] = {
      ...input.items[0]!,
      unitPrice: 10_001n,
      assignments: [
        { id: a1, participantId: p1 },
        { id: a2, participantId: p2 },
        { id: a3, participantId: p3 },
      ],
    };
    const result = calculateSplitBill(input);
    expect(result.participants.map(({ finalAmount }) => finalAmount)).toEqual([
      3_334n,
      3_334n,
      3_333n,
    ]);
    expect(result.participants.reduce((sum, row) => sum + row.finalAmount, 0n))
      .toBe(result.finalAmount);
  });

  it("allocates fixed discount across several items", () => {
    const input = base();
    input.discountMode = "fixed";
    input.fixedDiscountAmount = 3_001n;
    input.items.push({
      id: i2,
      name: "Minum",
      position: 2,
      quantity: 1,
      unitPrice: 5_000n,
      itemTaxBps: 0,
      assignments: [{ id: a2, participantId: p1 }],
    });
    const result = calculateSplitBill(input);
    expect(result.discountAmount).toBe(3_001n);
    expect(result.items.map(({ discountAmount }) => discountAmount)).toEqual([
      2_001n,
      1_000n,
    ]);
    expect(result.finalAmount).toBe(11_999n);
  });

  it("rounds percentage discount half-up", () => {
    const input = base();
    input.items[0]!.unitPrice = 101n;
    input.discountMode = "percentage";
    input.discountBps = 5_000;
    const result = calculateSplitBill(input);
    expect(result.discountAmount).toBe(51n);
    expect(result.finalAmount).toBe(50n);
  });

  it("prevents double tax and reconciles discount, tax, and service", () => {
    const input = base();
    input.participants.push({ id: p2, name: "Bima", position: 2 });
    input.discountMode = "fixed";
    input.fixedDiscountAmount = 2_000n;
    input.billTaxBps = 1_000;
    input.serviceChargeBps = 1_000;
    input.items[0]!.itemTaxBps = 1_000;
    input.items.push({
      id: i2,
      name: "Minum",
      position: 2,
      quantity: 1,
      unitPrice: 10_000n,
      itemTaxBps: 0,
      assignments: [{ id: a2, participantId: p2 }],
    });
    const result = calculateSplitBill(input);
    expect(result.discountAmount).toBe(2_000n);
    expect(result.itemTaxAmount).toBe(900n);
    expect(result.billTaxAmount).toBe(900n);
    expect(result.items[0]?.billTaxAmount).toBe(0n);
    expect(result.serviceChargeAmount).toBe(1_800n);
    expect(result.finalAmount).toBe(21_600n);
    expect(result.participants.map(({ finalAmount }) => finalAmount)).toEqual([
      10_800n,
      10_800n,
    ]);
  });

  it("applies a fixed nominal tax directly when the mode is fixed", () => {
    const input = base();
    input.billTaxMode = "fixed";
    input.fixedBillTaxAmount = 2_500n;
    input.billTaxBps = 0;
    const result = calculateSplitBill(input);
    expect(result.billTaxAmount).toBe(2_500n);
    expect(result.finalAmount).toBe(12_500n);
  });

  it("rejects a fixed tax combined with a percentage value and vice versa", () => {
    const fixedWithBps = base();
    fixedWithBps.billTaxMode = "fixed";
    fixedWithBps.fixedBillTaxAmount = 1_000n;
    fixedWithBps.billTaxBps = 1_000;
    expect(() => calculateSplitBill(fixedWithBps)).toThrow(
      "Konfigurasi pajak tidak valid.",
    );

    const percentageWithFixed = base();
    percentageWithFixed.billTaxMode = "percentage";
    percentageWithFixed.fixedBillTaxAmount = 1_000n;
    expect(() => calculateSplitBill(percentageWithFixed)).toThrow(
      "Konfigurasi pajak tidak valid.",
    );
  });

  it("allows a full discount without division by zero", () => {
    const input = base();
    input.discountMode = "percentage";
    input.discountBps = 10_000;
    input.billTaxBps = 1_000;
    input.serviceChargeBps = 1_000;
    expect(calculateSplitBill(input).finalAmount).toBe(0n);
  });

  it("returns the same output for repeated calculation", () => {
    const input = base();
    const serialize = (value: unknown) =>
      JSON.stringify(value, (_, nested) =>
        typeof nested === "bigint" ? nested.toString() : nested,
      );
    expect(serialize(calculateSplitBill(input))).toBe(
      serialize(calculateSplitBill(input)),
    );
  });

  it("rejects an unassigned item", () => {
    const input = base();
    input.items[0]!.assignments = [];
    expect(() => calculateSplitBill(input)).toThrowError(
      SplitBillCalculationError,
    );
    try {
      calculateSplitBill(input);
    } catch (error) {
      expect((error as SplitBillCalculationError).code).toBe("unassigned");
    }
  });

  it("rejects fixed discount above subtotal", () => {
    const input = base();
    input.discountMode = "fixed";
    input.fixedDiscountAmount = 10_001n;
    expect(() => calculateSplitBill(input)).toThrow("melebihi subtotal");
  });

  it("protects the supported monetary range", () => {
    const input = base();
    input.items[0]!.quantity = 2;
    input.items[0]!.unitPrice = 9_007_199_254_740_991n;
    expect(() => calculateSplitBill(input)).toThrow("rentang");
  });
});
