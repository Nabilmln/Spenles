import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  buildMonthGrid,
  daysInMonth,
  formatReportRange,
  inclusiveDayCount,
  isReportDate,
  isValidReportRange,
  monthShift,
} from "./report-date";

describe("report date utilities", () => {
  it("recognizes valid calendar-only dates", () => {
    expect(isReportDate("2026-08-07")).toBe(true);
    expect(isReportDate("2024-02-29")).toBe(true);
    expect(isReportDate("2025-02-29")).toBe(false);
    expect(isReportDate("2026-13-01")).toBe(false);
    expect(isReportDate("2026-00-01")).toBe(false);
    expect(isReportDate("07-08-2026")).toBe(false);
  });

  it("counts inclusive days including a single day", () => {
    expect(inclusiveDayCount("2026-08-01", "2026-08-01")).toBe(1);
    expect(inclusiveDayCount("2026-08-01", "2026-08-07")).toBe(7);
    expect(inclusiveDayCount("2024-01-01", "2024-12-31")).toBe(366);
    expect(inclusiveDayCount("bad", "2026-08-07")).toBe(0);
  });

  it("validates ranges up to the max days", () => {
    expect(isValidReportRange("2024-01-01", "2024-12-31", 366)).toBe(true);
    expect(isValidReportRange("2024-01-01", "2025-01-01", 366)).toBe(false);
    expect(isValidReportRange("2026-08-07", "2026-08-01")).toBe(false);
  });

  it("adds calendar days across month and year boundaries", () => {
    expect(addCalendarDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addCalendarDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addCalendarDays("bad", 1)).toBeNull();
  });

  it("formats compact ranges bilingual of year boundary", () => {
    expect(formatReportRange("2026-08-01", "2026-09-01")).toBe(
      "1 Agustus – 1 September 2026",
    );
    expect(formatReportRange("2026-12-20", "2027-01-10")).toBe(
      "20 Desember 2026 – 10 Januari 2027",
    );
  });

  it("builds a Monday-first month grid", () => {
    const grid = buildMonthGrid(2026, 8);
    const days = grid.filter((cell): cell is NonNullable<typeof cell> => cell !== null);
    expect(days).toHaveLength(daysInMonth(2026, 8));
    expect(grid[0]).toBeNull();
    expect(grid[0] === null && grid[1] === null && grid[2] === null && grid[3] === null && grid[4] === null).toBe(true);
    expect(grid[5]).toMatchObject({ day: 1, date: "2026-08-01" });
  });

  it("shifts months across year boundary", () => {
    expect(monthShift(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(monthShift(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
  });
});