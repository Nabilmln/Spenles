import { describe, expect, it } from "vitest";
import { safeParseDashboardFilters } from "./dashboard-filters";

describe("safeParseDashboardFilters", () => {
  it("uses current month by default", () => {
    expect(safeParseDashboardFilters({ ignored: "safe" })).toEqual({
      success: true,
      data: {
        selection: { kind: "preset", period: "current-month" },
      },
    });
  });

  it("accepts a specific month", () => {
    expect(
      safeParseDashboardFilters({
        month: "2026-08",
      }),
    ).toEqual({
      success: true,
      data: {
        selection: { kind: "month", month: "2026-08" },
      },
    });
  });

  it("accepts a 366-day leap-year custom range", () => {
    expect(
      safeParseDashboardFilters({
        period: "custom",
        from: "2024-01-01",
        to: "2024-12-31",
      }).success,
    ).toBe(true);
  });

  it("rejects a 367-day custom range", () => {
    expect(
      safeParseDashboardFilters({
        period: "custom",
        from: "2024-01-01",
        to: "2025-01-01",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid dates, reversed dates, and incomplete custom ranges", () => {
    expect(
      safeParseDashboardFilters({
        period: "custom",
        from: "2026-02-30",
        to: "2026-03-01",
      }).success,
    ).toBe(false);
    expect(
      safeParseDashboardFilters({
        period: "custom",
        from: "2026-08-02",
        to: "2026-08-01",
      }).success,
    ).toBe(false);
    expect(
      safeParseDashboardFilters({
        period: "custom",
        from: "2026-08-01",
      }).success,
    ).toBe(false);
  });

  it("rejects conflicting and repeated recognized parameters", () => {
    expect(
      safeParseDashboardFilters({
        month: "2026-08",
        period: "current-month",
      }).success,
    ).toBe(false);
    expect(
      safeParseDashboardFilters({
        period: ["current-month", "current-year"],
      }).success,
    ).toBe(false);
  });
});
