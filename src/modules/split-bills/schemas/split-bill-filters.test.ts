import { describe, expect, it } from "vitest";
import { parseSplitBillFilters } from "./split-bill-filters";

describe("split-bill filters", () => {
  it("accepts canonical private history state", () => {
    const parsed = parseSplitBillFilters({
      status: "finalized",
      month: "2026-08",
      q: " Warung ",
      page: "2",
      pageSize: "10",
    });
    expect(parsed.success && parsed.data).toEqual({
      status: "finalized",
      month: "2026-08",
      q: "Warung",
      page: 2,
      pageSize: 10,
    });
  });

  it("rejects unsupported status, month, and page size", () => {
    expect(
      parseSplitBillFilters({
        status: "deleted",
        month: "2026-13",
        pageSize: "1000",
      }).success,
    ).toBe(false);
  });
});
