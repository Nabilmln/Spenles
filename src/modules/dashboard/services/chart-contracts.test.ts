import { describe, expect, it } from "vitest";
import {
  buildCategoryChartContract,
  buildCategoryVisualPoints,
  buildDailyCashFlowContract,
  buildFourDayExpenseChartContract,
  buildMonthlyCashFlowContract,
  buildMonthlyChartContract,
  buildWeeklyCashFlowContract,
} from "./chart-contracts";
import {
  lastDaysJakartaInterval,
  lastMonthsJakartaInterval,
  lastWeeksJakartaInterval,
} from "./periods";

describe("dashboard chart contracts", () => {
  it("zero-fills months and preserves exact totals", () => {
    const contract = buildMonthlyChartContract(
      ["2026-06", "2026-07", "2026-08"],
      [
        { period: "2026-06", income: 20n, expense: 10n },
        { period: "2026-08", income: 5n, expense: 30n },
      ],
    );

    expect(contract.filled[1]).toEqual({
      period: "2026-07",
      income: 0n,
      expense: 0n,
    });
    expect(contract.totalIncome).toBe(25n);
    expect(contract.totalExpense).toBe(40n);
    expect(contract.expensePoints[2].expenseIdr).toBe("30");
    expect(contract.expensePoints[2].plot).toBe(1);
  });

  it("keeps category shares reconciled to exactly 100 percent", () => {
    const contract = buildCategoryChartContract(
      ["a", "b", "c"].map((categoryId) => ({
        categoryId,
        name: categoryId.toUpperCase(),
        normalizedName: categoryId,
        color: null,
        icon: null,
        expense: 1n,
      })),
    );

    expect(
      contract.points.reduce((sum, point) => sum + point.shareBps, 0),
    ).toBe(10_000);
    expect(contract.totalExpense).toBe(3n);
  });

  it("collapses visual categories after the fifth without changing totals", () => {
    const contract = buildCategoryChartContract(
      Array.from({ length: 7 }, (_, index) => ({
        categoryId: String(index),
        name: `Kategori ${index}`,
        normalizedName: `kategori ${index}`,
        color: "blue",
        icon: null,
        expense: BigInt(7 - index),
      })),
    );
    const visual = buildCategoryVisualPoints(contract.points);

    expect(visual).toHaveLength(6);
    expect(visual[5].categoryId).toBe("__other__");
    expect(
      visual.reduce((sum, point) => sum + BigInt(point.expenseIdr), 0n),
    ).toBe(contract.totalExpense);
    expect(visual.reduce((sum, point) => sum + point.shareBps, 0)).toBe(10_000);
  });

  it("assigns a distinct color to every pie slice", () => {
    const contract = buildCategoryChartContract(
      Array.from({ length: 7 }, (_, index) => ({
        categoryId: String(index),
        name: `Kategori ${index}`,
        normalizedName: `kategori ${index}`,
        color: null,
        icon: null,
        expense: BigInt(7 - index),
      })),
    );
    const visual = buildCategoryVisualPoints(contract.points);

    expect(new Set(visual.map((point) => point.color)).size).toBe(
      visual.length,
    );
    expect(visual[0].color).not.toBe(visual[1].color);
    expect(visual[5].color).not.toBe(visual[0].color);
  });
});

describe("four-day recent expense chart", () => {
  const now = new Date("2026-08-06T04:00:00.000Z");

  it("builds exactly four Jakarta days ending today and zero-fills gaps", () => {
    const contract = buildFourDayExpenseChartContract(now, [
      { day: "2026-08-04", expense: 25_000n },
      { day: "2026-08-06", expense: 50_000n },
    ]);

    expect(contract.points.map((point) => point.day)).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
    ]);
    expect(contract.points.map((point) => point.label)).toEqual([
      "August 3",
      "August 4",
      "August 5",
      "August 6",
    ]);
    expect(contract.points.map((point) => point.expenseIdr)).toEqual([
      "0",
      "25000",
      "0",
      "50000",
    ]);
    expect(contract.points[3].plot).toBe(1);
    expect(contract.totalExpense).toBe(75_000n);
  });

  it("renders a zero baseline when the recent window has no expense", () => {
    const contract = buildFourDayExpenseChartContract(now, []);

    expect(contract.points).toHaveLength(4);
    expect(contract.points.every((point) => point.expenseIdr === "0")).toBe(
      true,
    );
    expect(contract.points.every((point) => point.plot === 0)).toBe(true);
    expect(contract.totalExpense).toBe(0n);
  });
});

describe("cash-flow chart contracts", () => {
  const now = new Date("2026-08-05T10:00:00.000Z");

  it("builds seven zero-filled Jakarta days with compact labels", () => {
    const contract = buildDailyCashFlowContract(
      lastDaysJakartaInterval(7, now),
      [
        { period: "2026-07-30", income: 100n, expense: 40n },
        { period: "2026-08-03", income: 0n, expense: 25n },
      ],
    );

    expect(contract.points.map((point) => point.period)).toEqual([
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
    ]);
    expect(contract.points.map((point) => point.label)).toEqual([
      "30 Thu",
      "31 Fri",
      "1 Sat",
      "2 Sun",
      "3 Mon",
      "4 Tue",
      "5 Wed",
    ]);
    expect(contract.totalIncome).toBe(100n);
    expect(contract.totalExpense).toBe(65n);
    expect(contract.points[0].incomePlot).toBe(1);
    expect(contract.points[4].expenseIdr).toBe("25");
  });

  it("builds four Monday-start weeks with start-of-week labels", () => {
    const contract = buildWeeklyCashFlowContract(
      lastWeeksJakartaInterval(4, now),
      [{ period: "2026-07-13", income: 1000n, expense: 400n }],
    );

    expect(contract.points.map((point) => point.period)).toEqual([
      "2026-07-13",
      "2026-07-20",
      "2026-07-27",
      "2026-08-03",
    ]);
    expect(contract.points.map((point) => point.label)).toEqual([
      "Jul 13",
      "Jul 20",
      "Jul 27",
      "Aug 3",
    ]);
    expect(contract.totalIncome).toBe(1000n);
    expect(contract.totalExpense).toBe(400n);
  });

  it("builds twelve months ending with the current month", () => {
    const contract = buildMonthlyCashFlowContract(
      lastMonthsJakartaInterval(12, now),
      [
        { period: "2025-09", income: 500n, expense: 200n },
        { period: "2026-08", income: 1000n, expense: 300n },
      ],
    );

    expect(contract.points).toHaveLength(12);
    expect(contract.points[0].period).toBe("2025-09");
    expect(contract.points[0].label).toBe("Sep 25");
    expect(contract.points[11].period).toBe("2026-08");
    expect(contract.points[11].label).toBe("Aug 26");
    expect(contract.totalIncome).toBe(1500n);
    expect(contract.totalExpense).toBe(500n);
    expect(contract.points[11].incomePlot).toBe(1);
  });
});
