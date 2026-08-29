import { describe, expect, it } from "vitest";
import { splitBillDraftSchema } from "./split-bill";

const participantId = "00000000-0000-4000-8000-000000000001";
const itemId = "10000000-0000-4000-8000-000000000001";

function valid() {
  return {
    merchantName: "Warung",
    billDate: "2026-08-05",
    note: "",
    discountMode: "none",
    fixedDiscountAmount: "0",
    discountBps: 0,
    billTaxMode: "percentage",
    fixedBillTaxAmount: "0",
    billTaxBps: 0,
    serviceChargeBps: 0,
    participants: [{ id: participantId, name: "Ayu" }],
    items: [
      {
        id: itemId,
        name: "Nasi",
        quantity: 1,
        unitPrice: "10000",
        itemTaxBps: 0,
        participantIds: [participantId],
      },
    ],
  };
}

describe("split-bill schema", () => {
  it("normalizes an optional note", () => {
    const parsed = splitBillDraftSchema.parse(valid());
    expect(parsed.note).toBeNull();
  });

  it("rejects an invalid date and percentage", () => {
    const input = valid();
    input.billDate = "2026-02-30";
    input.billTaxBps = 10_001;
    expect(splitBillDraftSchema.safeParse(input).success).toBe(false);
  });

  it("rejects foreign and duplicate assignments", () => {
    const input = valid();
    input.items[0]!.participantIds = [
      participantId,
      participantId,
      "00000000-0000-4000-8000-000000000099",
    ];
    expect(splitBillDraftSchema.safeParse(input).success).toBe(false);
  });

  it("rejects an item subtotal overflow", () => {
    const input = valid();
    input.items[0]!.quantity = 2;
    input.items[0]!.unitPrice = "9007199254740991";
    expect(splitBillDraftSchema.safeParse(input).success).toBe(false);
  });

  it("accepts a fixed nominal tax and rejects mixed tax modes", () => {
    const fixed = valid();
    fixed.billTaxMode = "fixed";
    fixed.fixedBillTaxAmount = "5000";
    fixed.billTaxBps = 0;
    expect(splitBillDraftSchema.safeParse(fixed).success).toBe(true);

    const mixed = valid();
    mixed.billTaxMode = "fixed";
    mixed.fixedBillTaxAmount = "5000";
    mixed.billTaxBps = 1000;
    expect(splitBillDraftSchema.safeParse(mixed).success).toBe(false);

    const reversed = valid();
    reversed.billTaxMode = "percentage";
    reversed.fixedBillTaxAmount = "5000";
    expect(splitBillDraftSchema.safeParse(reversed).success).toBe(false);
  });
});
