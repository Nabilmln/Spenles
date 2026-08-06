import { describe, expect, it } from "vitest";
import {
  buildCategoryChartContract,
  buildCategoryVisualPoints,
  buildFourDayExpenseChartContract,
  buildMonthlyChartContract,
} from "./chart-contracts";

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
      "3 Agu",
      "4 Agu",
      "5 Agu",
      "6 Agu",
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
