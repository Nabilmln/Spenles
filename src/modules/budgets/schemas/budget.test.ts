import { describe, expect, it } from "vitest";
import { budgetSchema } from "./budget";

describe("budgetSchema", () => {
  it("accepts canonical month and basis-point threshold", () => {
    expect(
      budgetSchema.safeParse({
        categoryId: "11111111-1111-4111-8111-111111111111",
        month: "2026-08",
        amount: "500000",
        warningThresholdBps: "8000",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid month, zero amount, and out-of-range thresholds", () => {
    for (const values of [
      { month: "2026-8", amount: "1", warningThresholdBps: 8000 },
      { month: "2026-08", amount: "0", warningThresholdBps: 8000 },
      { month: "2026-08", amount: "1", warningThresholdBps: 10001 },
    ]) {
      expect(
        budgetSchema.safeParse({
          categoryId: "11111111-1111-4111-8111-111111111111",
          ...values,
        }).success,
      ).toBe(false);
    }
  });
});
