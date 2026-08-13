import { describe, expect, it } from "vitest";
import {
  countCalendarDays,
  fourDayJakartaInterval,
  lastDaysJakartaInterval,
  lastMonthsJakartaInterval,
  lastWeeksJakartaInterval,
  monthIntervalForKey,
  resolveDashboardPeriods,
} from "./periods";

const now = new Date("2026-08-05T10:00:00.000Z");

describe("resolveDashboardPeriods", () => {
  it("builds complete current and previous Jakarta calendar months", () => {
    const periods = resolveDashboardPeriods(
      {
        selection: { kind: "preset", period: "current-month" },
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
      },
      now,
    );

    expect(periods.selected.startDate).toBe("2026-01-01");
    expect(periods.previous.startDate).toBe("2025-12-01");
  });

  it("uses an equal inclusive-day duration for custom previous periods", () => {
    const periods = resolveDashboardPeriods(
      {
        selection: {
          kind: "custom",
          from: "2024-02-28",
          to: "2024-03-01",
        },
      },
      now,
    );

    expect(periods.selected.startDate).toBe("2024-02-28");
    expect(periods.selected.endDateExclusive).toBe("2024-03-02");
    expect(periods.previous.startDate).toBe("2024-02-25");
    expect(periods.previous.endDateExclusive).toBe("2024-02-28");
    expect(periods.selectedMonthKeys).toEqual(["2024-02", "2024-03"]);
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

describe("countCalendarDays", () => {
  it("counts full calendar months including leap days", () => {
    expect(countCalendarDays(monthIntervalForKey("2026-08"))).toBe(31);
    expect(countCalendarDays(monthIntervalForKey("2026-02"))).toBe(28);
    expect(countCalendarDays(monthIntervalForKey("2024-02"))).toBe(29);
  });

  it("counts exact calendar days for arbitrary intervals", () => {
    const interval = resolveDashboardPeriods(
      {
        selection: {
          kind: "custom",
          from: "2026-08-10",
          to: "2026-08-20",
        },
      },
      now,
    );

    expect(countCalendarDays(interval.selected)).toBe(11);
  });
});

describe("cash-flow range intervals", () => {
  it("covers the last seven Jakarta calendar days", () => {
    const interval = lastDaysJakartaInterval(7, now);

    expect(interval.startDate).toBe("2026-07-30");
    expect(interval.endDateExclusive).toBe("2026-08-06");
    expect(interval.start.toISOString()).toBe("2026-07-29T17:00:00.000Z");
    expect(interval.end.toISOString()).toBe("2026-08-05T17:00:00.000Z");
  });

  it("covers the last four Monday-start calendar weeks", () => {
    const interval = lastWeeksJakartaInterval(4, now);

    expect(interval.startDate).toBe("2026-07-13");
    expect(interval.endDateExclusive).toBe("2026-08-10");
    expect(interval.label).toBe("4 minggu terakhir");
  });

  it("covers the last twelve calendar months including the current month", () => {
    const interval = lastMonthsJakartaInterval(12, now);

    expect(interval.startDate).toBe("2025-09-01");
    expect(interval.endDateExclusive).toBe("2026-09-01");
    expect(countCalendarDays(interval)).toBe(365);
  });
});
