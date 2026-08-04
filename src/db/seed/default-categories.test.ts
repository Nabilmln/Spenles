import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "./default-categories";

describe("default category definitions", () => {
  it("contains the documented expense and income totals", () => {
    expect(DEFAULT_EXPENSE_CATEGORIES).toHaveLength(12);
    expect(DEFAULT_INCOME_CATEGORIES).toHaveLength(8);
    expect(DEFAULT_CATEGORIES).toHaveLength(20);
  });

  it("uses unique stable system keys", () => {
    const keys = DEFAULT_CATEGORIES.map((category) => category.systemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps income and expense variants of Lainnya separate", () => {
    const otherCategories = DEFAULT_CATEGORIES.filter(
      (category) => category.name === "Lainnya",
    );
    expect(otherCategories.map((category) => category.type).sort()).toEqual([
      "expense",
      "income",
    ]);
  });
});
