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
      sort: "amount",
      direction: "asc",
    });
    expect(parsed.success && parsed.data).toEqual({
      status: "finalized",
      month: "2026-08",
      q: "Warung",
      page: 2,
      pageSize: 10,
      sort: "amount",
      direction: "asc",
    });
  });

  it("defaults sort and direction independently", () => {
    const parsed = parseSplitBillFilters({});
    expect(parsed.success && parsed.data).toMatchObject({
      sort: "billDate",
      direction: "desc",
      q: "",
      page: 1,
      pageSize: 20,
    });
  });

  it("rejects unsupported status, month, page size, and direction", () => {
    expect(
      parseSplitBillFilters({
        status: "deleted",
        month: "2026-13",
        pageSize: "1000",
        direction: "sideways",
      }).success,
    ).toBe(false);
  });
});
