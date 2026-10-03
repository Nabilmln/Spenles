import { describe, expect, it } from "vitest";
import { monthIntervalForKey } from "@/modules/dashboard/services/periods";
import { buildMonthlyExpenseOverview } from "./expense-overview";

describe("monthly expense overview", () => {
  it("shows a full month axis including future-dated spending immediately", () => {
    const result = buildMonthlyExpenseOverview(
      monthIntervalForKey("2026-09"),
      [
        { period: "2026-09-01", income: 0n, expense: 100n },
        { period: "2026-09-03", income: 0n, expense: 200n },
        { period: "2026-09-30", income: 0n, expense: 900n },
      ],
    );

    expect(result.points).toHaveLength(30);
    expect(result.points[0].period).toBe("2026-09-01");
    expect(result.points.at(-1)?.period).toBe("2026-09-30");
    expect(result.totalExpense).toBe(1200n);
    expect(result.points[0].expenseIdr).toBe("100");
    expect(result.points[2].expenseIdr).toBe("300");
    expect(result.points[2].expensePlot).toBe(0.25);
    expect(result.points.at(-1)?.expenseIdr).toBe("1200");
  });

  it("keeps an empty month at zero", () => {
    const result = buildMonthlyExpenseOverview(
      monthIntervalForKey("2026-02"),
      [],
    );

    expect(result.points).toHaveLength(28);
    expect(result.totalExpense).toBe(0n);
    expect(result.points.every((point) => point.expensePlot === 0)).toBe(true);
  });
});
