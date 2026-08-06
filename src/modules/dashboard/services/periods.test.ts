import { describe, expect, it } from "vitest";
import { fourDayJakartaInterval, resolveDashboardPeriods } from "./periods";

const now = new Date("2026-08-05T10:00:00.000Z");

describe("resolveDashboardPeriods", () => {
  it("builds complete current and previous Jakarta calendar months", () => {
    const periods = resolveDashboardPeriods(
      {
        selection: { kind: "preset", period: "current-month" },
        chartRange: "6-months",
      },
      now,
    );

    expect(periods.selected.start.toISOString()).toBe(
      "2026-07-31T17:00:00.000Z",
    );
    expect(periods.selected.end.toISOString()).toBe(
      "2026-08-31T17:00:00.000Z",
    );
    expect(periods.previous.startDate).toBe("2026-07-01");
    expect(periods.previous.endDateExclusive).toBe("2026-08-01");
  });

  it("keeps last-three calendar buckets and previous buckets disjoint", () => {
    const periods = resolveDashboardPeriods(
      {
        selection: { kind: "preset", period: "last-3-months" },
        chartRange: "6-months",
      },
      now,
    );

    expect(periods.selectedMonthKeys).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
    expect(periods.previous.startDate).toBe("2026-03-01");
    expect(periods.previous.endDateExclusive).toBe("2026-06-01");
  });

  it("handles a specific January and its previous year boundary", () => {
    const periods = resolveDashboardPeriods(
      {
        selection: { kind: "month", month: "2026-01" },
        chartRange: "current-year",
      },
      now,
    );

    expect(periods.selected.startDate).toBe("2026-01-01");
    expect(periods.previous.startDate).toBe("2025-12-01");
    expect(periods.chartMonthKeys).toHaveLength(12);
    expect(periods.chartMonthKeys[0]).toBe("2026-01");
  });

  it("uses an equal inclusive-day duration for custom previous periods", () => {
    const periods = resolveDashboardPeriods(
      {
        selection: {
          kind: "custom",
          from: "2024-02-28",
          to: "2024-03-01",
        },
        chartRange: "6-months",
      },
      now,
    );

    expect(periods.selected.startDate).toBe("2024-02-28");
    expect(periods.selected.endDateExclusive).toBe("2024-03-02");
    expect(periods.previous.startDate).toBe("2024-02-25");
    expect(periods.previous.endDateExclusive).toBe("2024-02-28");
    expect(periods.selectedMonthKeys).toEqual(["2024-02", "2024-03"]);
  });

  it("uses six and twelve complete chart buckets including current month", () => {
    const six = resolveDashboardPeriods(
      {
        selection: { kind: "preset", period: "current-month" },
        chartRange: "6-months",
      },
      now,
    );
    const twelve = resolveDashboardPeriods(
      {
        selection: { kind: "preset", period: "current-month" },
        chartRange: "12-months",
      },
      now,
    );

    expect(six.chartMonthKeys).toEqual([
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
    expect(twelve.chartMonthKeys).toHaveLength(12);
    expect(twelve.chartMonthKeys.at(-1)).toBe("2026-08");
  });
});

describe("fourDayJakartaInterval", () => {
  it("covers exactly the four Jakarta calendar days ending today", () => {
    const interval = fourDayJakartaInterval(
      new Date("2026-08-06T04:00:00.000Z"),
    );

    expect(interval.startDate).toBe("2026-08-03");
    expect(interval.endDateExclusive).toBe("2026-08-07");
    expect(interval.start.toISOString()).toBe("2026-08-02T17:00:00.000Z");
    expect(interval.end.toISOString()).toBe("2026-08-06T17:00:00.000Z");
  });

  it("rolls the Jakarta day boundary at 17:00 UTC", () => {
    const before = fourDayJakartaInterval(
      new Date("2026-08-05T16:59:59.999Z"),
    );
    const after = fourDayJakartaInterval(
      new Date("2026-08-05T17:00:00.000Z"),
    );

    expect(before.startDate).toBe("2026-08-02");
    expect(before.endDateExclusive).toBe("2026-08-06");
    expect(after.startDate).toBe("2026-08-03");
    expect(after.endDateExclusive).toBe("2026-08-07");
  });
});
