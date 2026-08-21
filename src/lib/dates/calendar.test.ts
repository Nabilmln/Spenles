import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  inclusiveDayCount,
  isDateKey,
  isReportDate,
  isValidReportRange,
  parseDateKey,
} from "./calendar";

describe("calendar date-key utilities", () => {
  it("parses valid calendar-only ISO dates", () => {
    expect(parseDateKey("2026-08-21")).toEqual({ year: 2026, month: 8, day: 21 });
    expect(parseDateKey("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseDateKey("1970-01-01")).toEqual({ year: 1970, month: 1, day: 1 });
  });

  it("rejects malformed and impossible dates", () => {
    expect(parseDateKey("2026-8-21")).toBeNull();
    expect(parseDateKey("2026/08/21")).toBeNull();
    expect(parseDateKey("2026-13-01")).toBeNull();
    expect(parseDateKey("2026-00-01")).toBeNull();
    expect(parseDateKey("2025-02-29")).toBeNull();
    expect(parseDateKey("2026-04-31")).toBeNull();
    expect(parseDateKey("not-a-date")).toBeNull();
  });

  it("treats empty and boundary values safely", () => {
    expect(isDateKey("")).toBe(false);
    expect(parseDateKey("")).toBeNull();
    expect(isDateKey("0000-01-01")).toBe(false);
    expect(parseDateKey("9999-12-31")).toEqual({ year: 9999, month: 12, day: 31 });
  });

  it("keeps isReportDate consistent with isDateKey", () => {
    expect(isReportDate("2026-08-21")).toBe(isDateKey("2026-08-21"));
    expect(isReportDate("2026-02-30")).toBe(false);
  });

  it("counts inclusive days including a single day", () => {
    expect(inclusiveDayCount("2026-08-01", "2026-08-01")).toBe(1);
    expect(inclusiveDayCount("2026-08-01", "2026-08-07")).toBe(7);
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
});