import { describe, expect, it } from "vitest";
import {
  formatJakartaDate,
  jakartaNowDate,
  JAKARTA_OFFSET_MS,
  JAKARTA_TIMEZONE,
  preserveOrAttachNow,
} from "./jakarta";

describe("formatJakartaDate", () => {
  it("formats a date as YYYY-MM-DD in Asia/Jakarta", () => {
    expect(formatJakartaDate(new Date("2026-08-04T13:00:00Z"))).toBe("2026-08-04");
  });
});

describe("jakarta constants", () => {
  it("uses Asia/Jakarta and a fixed UTC+7 offset", () => {
    expect(JAKARTA_TIMEZONE).toBe("Asia/Jakarta");
    expect(JAKARTA_OFFSET_MS).toBe(7 * 60 * 60 * 1000);
  });
});

describe("jakartaNowDate", () => {
  it("returns a real YYYY-MM-DD string", () => {
    expect(jakartaNowDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });
});

describe("preserveOrAttachNow", () => {
  it("null for an invalid date string", () => {
    expect(preserveOrAttachNow("not-a-date")).toBeNull();
    expect(preserveOrAttachNow("2026-02-30")).toBeNull();
  });

  it("attaches the current Jakarta clock to a date only string", () => {
    const result = preserveOrAttachNow("2026-08-04");
    expect(result).toBeInstanceOf(Date);
    expect(formatJakartaDate(result!)).toBe("2026-08-04");
  });

  it("preserves the original timestamp when the date unchanged", () => {
    const original = new Date("2026-08-04T10:15:00+07:00");
    const result = preserveOrAttachNow("2026-08-04", original);
    expect(result!.getTime()).toBe(original.getTime());
  });

  it("attaches a new time when the date changed", () => {
    const original = new Date("2026-08-04T10:15:00+07:00");
    const result = preserveOrAttachNow("2026-08-05", original);
    expect(result).toBeInstanceOf(Date);
    expect(formatJakartaDate(result!)).toBe("2026-08-05");
  });
});