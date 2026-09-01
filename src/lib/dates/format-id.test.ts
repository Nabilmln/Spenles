import { describe, expect, it } from "vitest";
import { formatDayDateLong, formatDateLong, formatMonthYearLabel } from "./format-id";

describe("format-id", () => {
  it("formats full English dates", () => {
    expect(formatDateLong("2026-08-05")).toBe("5 August 2026");
  });

  it("prepends the English weekday", () => {
    expect(formatDayDateLong("2026-08-05")).toBe("Wednesday, 5 August 2026");
    expect(formatDayDateLong("2026-08-10")).toBe("Monday, 10 August 2026");
  });

  it("falls back to the raw value for invalid keys", () => {
    expect(formatDayDateLong("not-a-date")).toBe("not-a-date");
    expect(formatDateLong("not-a-date")).toBe("not-a-date");
  });

  it("formats a calendar month as English month and year", () => {
    expect(formatMonthYearLabel(2026, 8)).toBe("August 2026");
    expect(formatMonthYearLabel(2026, 1)).toBe("January 2026");
    expect(formatMonthYearLabel(2026, 12)).toBe("December 2026");
  });
});
