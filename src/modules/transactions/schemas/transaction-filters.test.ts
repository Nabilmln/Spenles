import { describe, expect, it } from "vitest";
import { parseTransactionFilters } from "./transaction-filters";

describe("transaction filters", () => {
  it("provides controlled defaults", () => {
    const result = parseTransactionFilters({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ page: 1, pageSize: 15, sort: "transactionAt", direction: "desc" });
  });

  it("accepts allowlisted sorting and pagination", () => {
    expect(parseTransactionFilters({ sort: "amount", direction: "asc", page: "2", pageSize: "50" }).success).toBe(true);
  });

  it.each([
    { sort: "userId" },
    { direction: "sideways" },
    { page: "0" },
    { pageSize: "100" },
    { category: "not-a-uuid" },
    { month: "2026-13" },
    { from: "2026-01-01" },
    { month: "2026-01", from: "2026-01-01", to: "2026-01-31" },
    { from: "2026-02-02", to: "2026-02-01" },
  ])("rejects invalid values %#", (value) => {
    expect(parseTransactionFilters(value).success).toBe(false);
  });

  it("uses only the first value for repeated parameters", () => {
    const result = parseTransactionFilters({ page: ["2", "999"] });
    expect(result.success && result.data.page).toBe(2);
  });

  it("accepts at most 366 inclusive calendar days", () => {
    expect(parseTransactionFilters({ from: "2024-01-01", to: "2024-12-31" }).success).toBe(true);
    expect(parseTransactionFilters({ from: "2024-01-01", to: "2025-01-01" }).success).toBe(false);
  });
});
