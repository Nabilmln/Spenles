import { describe, expect, it } from "vitest";
import {
  buildFinancialSnapshot,
  calculateExpenseRatioBps,
  classifyFinancialCondition,
  compareFinancialValue,
} from "./financial-metrics";

describe("financial metrics", () => {
  it("returns exact signed percentage changes for positive baselines", () => {
    expect(compareFinancialValue(150n, 100n)).toMatchObject({
      delta: 50n,
      state: "increase",
      changeBps: "5000",
    });
    expect(compareFinancialValue(0n, 100n)).toMatchObject({
      delta: -100n,
      state: "decrease",
      changeBps: "-10000",
    });
  });

  it("does not invent percentages for zero or negative baselines", () => {
    expect(compareFinancialValue(10n, 0n)).toMatchObject({
      state: "new",
      changeBps: null,
    });
    expect(compareFinancialValue(0n, 0n)).toMatchObject({
      state: "unchanged-zero",
      changeBps: null,
    });
    expect(compareFinancialValue(-10n, 0n)).toMatchObject({
      state: "absolute-only",
      changeBps: null,
    });
    expect(compareFinancialValue(10n, -10n)).toMatchObject({
      state: "absolute-only",
      changeBps: null,
    });
    expect(compareFinancialValue(-5n, -10n)).toMatchObject({
      delta: 5n,
      state: "absolute-only",
      changeBps: null,
    });
    expect(compareFinancialValue(-20n, -10n)).toMatchObject({
      delta: -10n,
      state: "absolute-only",
      changeBps: null,
    });
  });

  it("calculates ratios without division by zero", () => {
    expect(calculateExpenseRatioBps(0n, 10n)).toBeNull();
    expect(calculateExpenseRatioBps(3n, 2n)).toBe("6667");
  });

  it("classifies exact threshold boundaries", () => {
    expect(classifyFinancialCondition(0n, 0n)).toBe("no-data");
    expect(classifyFinancialCondition(0n, 1n)).toBe("deficit");
    expect(classifyFinancialCondition(100n, 69n)).toBe("healthy");
    expect(classifyFinancialCondition(100n, 70n)).toBe("attention");
    expect(classifyFinancialCondition(100n, 90n)).toBe("attention");
    expect(classifyFinancialCondition(100n, 91n)).toBe("deficit");
  });

  it("includes empty months in half-up monthly averages", () => {
    const snapshot = buildFinancialSnapshot(
      { income: 10n, expense: 5n },
      { income: 0n, expense: 0n },
      [
        { period: "2026-06", income: 10n, expense: 5n },
        { period: "2026-07", income: 0n, expense: 0n },
        { period: "2026-08", income: 0n, expense: 0n },
      ],
      [],
      3,
    );

    expect(snapshot.averageIncome).toBe(3n);
    expect(snapshot.averageExpense).toBe(2n);
    expect(snapshot.averageNet).toBe(1n);
    expect(snapshot.monthsWithData).toBe(1);
  });

  it("resolves category and month ties deterministically", () => {
    const snapshot = buildFinancialSnapshot(
      { income: 100n, expense: 20n },
      { income: 0n, expense: 0n },
      [
        { period: "2026-08", income: 0n, expense: 10n },
        { period: "2026-07", income: 0n, expense: 10n },
      ],
      [
        {
          categoryId: "b",
          name: "Zulu",
          normalizedName: "zulu",
          color: null,
          icon: null,
          expense: 10n,
        },
        {
          categoryId: "a",
          name: "Alfa",
          normalizedName: "alfa",
          color: null,
          icon: null,
          expense: 10n,
        },
      ],
      2,
    );

    expect(snapshot.largestExpenseCategory?.categoryId).toBe("a");
    expect(snapshot.highestExpenseMonth?.period).toBe("2026-07");
  });

  it("does not select an arbitrary highest month when expenses are all zero", () => {
    const snapshot = buildFinancialSnapshot(
      { income: 10n, expense: 0n },
      { income: 0n, expense: 0n },
      [{ period: "2026-08", income: 10n, expense: 0n }],
      [],
      1,
    );

    expect(snapshot.highestExpenseMonth).toBeNull();
  });
});
