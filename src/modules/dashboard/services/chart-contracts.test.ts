import { describe, expect, it } from "vitest";
import {
  buildCategoryChartContract,
  buildCategoryVisualPoints,
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
