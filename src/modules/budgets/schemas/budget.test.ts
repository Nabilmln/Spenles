import { describe, expect, it } from "vitest";
import { budgetSchema } from "./budget";

const base = {
  categoryId: "11111111-1111-4111-8111-111111111111",
};

describe("budgetSchema", () => {
  it("accepts a monthly budget with threshold warning", () => {
    expect(
      budgetSchema.safeParse({
        ...base,
        periodType: "monthly",
        periodStart: "",
        periodEnd: "",
        amount: "500000",
        warningMode: "threshold",
        warningThresholdBps: "8000",
        warningDaysRemaining: "",
      }).success,
    ).toBe(true);
  });

  it("accepts a weekly budget with days-remaining warning", () => {
    expect(
      budgetSchema.safeParse({
        ...base,
        periodType: "weekly",
        periodStart: "",
        periodEnd: "",
        amount: "200000",
        warningMode: "days",
        warningThresholdBps: "",
        warningDaysRemaining: "3",
      }).success,
    ).toBe(true);
  });

  it("accepts a custom range with valid dates", () => {
    expect(
      budgetSchema.safeParse({
        ...base,
        periodType: "custom",
        periodStart: "2026-08-01",
        periodEnd: "2026-08-20",
        amount: "100000",
        warningMode: "days",
        warningThresholdBps: "",
        warningDaysRemaining: "5",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid periods, amounts, thresholds, and warning combos", () => {
    for (const values of [
      {
        periodType: "monthly",
        periodStart: "x",
        periodEnd: "",
        amount: "1",
        warningMode: "threshold",
        warningThresholdBps: 8000,
        warningDaysRemaining: "",
      },
      {
        periodType: "custom",
        periodStart: "2026-08-20",
        periodEnd: "2026-08-01",
        amount: "1",
        warningMode: "threshold",
        warningThresholdBps: 8000,
        warningDaysRemaining: "",
      },
      {
        periodType: "custom",
        periodStart: "",
        periodEnd: "",
        amount: "1",
        warningMode: "threshold",
        warningThresholdBps: 8000,
        warningDaysRemaining: "",
      },
      {
        periodType: "monthly",
        periodStart: "",
        periodEnd: "",
        amount: "0",
        warningMode: "threshold",
        warningThresholdBps: 8000,
        warningDaysRemaining: "",
      },
      {
        periodType: "monthly",
        periodStart: "",
        periodEnd: "",
        amount: "1000",
        warningMode: "threshold",
        warningThresholdBps: 10001,
        warningDaysRemaining: "",
      },
      {
        periodType: "monthly",
        periodStart: "",
        periodEnd: "",
        amount: "1000",
        warningMode: "days",
        warningThresholdBps: "",
        warningDaysRemaining: "",
      },
      {
        periodType: "monthly",
        periodStart: "",
        periodEnd: "",
        amount: "1000",
        warningMode: "days",
        warningThresholdBps: "8000",
        warningDaysRemaining: "2",
      },
    ]) {
      expect(
        budgetSchema.safeParse({ ...base, ...values }).success,
      ).toBe(false);
    }
  });
});