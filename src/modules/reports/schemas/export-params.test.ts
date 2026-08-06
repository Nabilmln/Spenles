import { describe, expect, it } from "vitest";
import { parseCsvParams, parseReportParams } from "./export-params";

const now = new Date("2026-08-06T03:00:00.000Z");

describe("report and export parameters", () => {
  it("creates inclusive-start and exclusive-end Jakarta month bounds", () => {
    const parsed = parseReportParams(
      new URLSearchParams("period=month&month=2026-08&details=true"),
      now,
    );
    expect(parsed).toMatchObject({
      includeDetails: true,
      interval: {
        startDate: "2026-08-01",
        endDate: "2026-08-06",
        filePart: "2026-08",
      },
    });
    expect(parsed?.interval.start.toISOString()).toBe("2026-07-31T17:00:00.000Z");
    expect(parsed?.interval.end.toISOString()).toBe("2026-08-06T17:00:00.000Z");
  });

  it("accepts a leap-year 366-day custom range", () => {
    const parsed = parseReportParams(
      new URLSearchParams("period=custom&from=2024-01-01&to=2024-12-31"),
      now,
    );
    expect(parsed?.interval.endDate).toBe("2024-12-31");
  });

  it.each([
    "period=custom&from=2024-01-01&to=2025-01-01",
    "period=custom&from=2026-08-02&to=2026-08-01",
    "period=month&month=1999-12",
    "period=month&month=2026-09",
    "period=month&month=2026-08&unknown=x",
    "period=month&period=month&month=2026-08",
    "period=year&year=2025&month=2025-01",
    "period=month&month=2026-08&account=not-a-uuid",
    "period=month&month=2026-08&details=yes",
  ])("rejects invalid or ambiguous report params: %s", (query) => {
    expect(parseReportParams(new URLSearchParams(query), now)).toBeNull();
  });

  it("validates CSV filters and ignores empty optional form values", () => {
    const parsed = parseCsvParams(
      new URLSearchParams(
        "period=year&year=2025&type=&category=&account=&q=%20kopi%20",
      ),
      now,
    );
    expect(parsed).toMatchObject({ search: "kopi" });
  });
});
