import { describe, expect, it } from "vitest";
import { parseReportParams } from "./export-params";

describe("report parameters", () => {
  it("creates inclusive-start and exclusive-end Jakarta month bounds", () => {
    const parsed = parseReportParams(
      new URLSearchParams("period=month&month=2026-08"),
    );
    expect(parsed).toMatchObject({
      interval: {
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        filePart: "2026-08",
      },
    });
    expect(parsed?.interval.start.toISOString()).toBe("2026-07-31T17:00:00.000Z");
    expect(parsed?.interval.end.toISOString()).toBe("2026-08-31T17:00:00.000Z");
  });

  it("accepts a leap-year 366-day custom range", () => {
    const parsed = parseReportParams(
      new URLSearchParams("period=custom&from=2024-01-01&to=2024-12-31"),
    );
    expect(parsed?.interval.endDate).toBe("2024-12-31");
  });

  it("accepts future report periods when transactions are dated ahead", () => {
    const month = parseReportParams(new URLSearchParams("period=month&month=2027-09"));
    const range = parseReportParams(new URLSearchParams("period=custom&from=2027-09-01&to=2027-09-30"));
    expect(month?.interval.endDate).toBe("2027-09-30");
    expect(range?.interval.endDate).toBe("2027-09-30");
  });

  it.each([
    "period=custom&from=2024-01-01&to=2025-01-01",
    "period=custom&from=2026-08-02&to=2026-08-01",
    "period=month&month=1999-12",
    "period=month&month=2026-08&unknown=x",
    "period=month&period=month&month=2026-08",
    "period=year&year=2025&month=2025-01",
    "period=month&month=2026-08&account=not-a-uuid",
    "period=month&month=2026-08&details=yes",
  ])("rejects invalid or ambiguous report params: %s", (query) => {
    expect(parseReportParams(new URLSearchParams(query))).toBeNull();
  });
});
