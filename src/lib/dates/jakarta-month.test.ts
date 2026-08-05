import { describe, expect, it } from "vitest";
import {
  budgetMonthToDate,
  isCanonicalMonth,
  jakartaMonthBounds,
  jakartaMonthForDate,
} from "./jakarta-month";

describe("Jakarta month helpers", () => {
  it("accepts only canonical supported months", () => {
    expect(isCanonicalMonth("2026-08")).toBe(true);
    expect(isCanonicalMonth("2026-8")).toBe(false);
    expect(isCanonicalMonth("2026-13")).toBe(false);
  });

  it("uses first-day storage and Jakarta exclusive boundaries", () => {
    expect(budgetMonthToDate("2026-08")).toBe("2026-08-01");
    const bounds = jakartaMonthBounds("2026-08");
    expect(bounds?.start.toISOString()).toBe("2026-07-31T17:00:00.000Z");
    expect(bounds?.end.toISOString()).toBe("2026-08-31T17:00:00.000Z");
  });

  it("resolves the month at a Jakarta boundary", () => {
    expect(jakartaMonthForDate(new Date("2026-07-31T16:59:59Z"))).toBe("2026-07");
    expect(jakartaMonthForDate(new Date("2026-07-31T17:00:00Z"))).toBe("2026-08");
  });
});
