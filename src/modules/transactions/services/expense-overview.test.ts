import { describe, expect, it } from "vitest";
import { monthIntervalForKey } from "@/modules/dashboard/services/periods";
import { buildMonthlyExpenseOverview } from "./expense-overview";

describe("monthly expense overview", () => {
  it("plots each day's spending, including future-dated spending, across the full month", () => {
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
    expect(result.points[1].expenseIdr).toBe("0");
    expect(result.points[1].expensePlot).toBe(0);
    expect(result.points[2].expenseIdr).toBe("200");
    expect(result.points[2].expensePlot).toBe(0.2222);
    expect(result.points[3].expensePlot).toBe(0);
    expect(result.points.at(-1)?.expenseIdr).toBe("900");
    expect(result.points.at(-1)?.expensePlot).toBe(1);
  });

  it("returns to zero after the last expense rather than carrying it to month end", () => {
    const result = buildMonthlyExpenseOverview(
      monthIntervalForKey("2026-09"),
      [{ period: "2026-09-03", income: 0n, expense: 200n }],
    );

    expect(result.totalExpense).toBe(200n);
    expect(result.points[2].expensePlot).toBe(1);
    expect(result.points.slice(3).every((point) => point.expensePlot === 0 && point.expenseIdr === "0")).toBe(true);
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
