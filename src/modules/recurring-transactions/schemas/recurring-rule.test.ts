import { describe, expect, it } from "vitest";
import { recurringRuleSchema } from "./recurring-rule";

const base = {
  type: "expense",
  amount: "100000",
  accountId: "11111111-1111-4111-8111-111111111111",
  categoryId: "22222222-2222-4222-8222-222222222222",
  frequency: "monthly",
  startAt: "2026-08-31T09:00",
  endDate: "",
  note: "",
};

describe("recurringRuleSchema", () => {
  it("accepts supported frequencies and optional end date", () => {
    expect(recurringRuleSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an end date before the Jakarta start date", () => {
    expect(
      recurringRuleSchema.safeParse({ ...base, endDate: "2026-08-30" }).success,
    ).toBe(false);
  });
});
