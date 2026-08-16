import { describe, expect, it } from "vitest";
import { formatDayDateLong, formatDateLong } from "./format-id";

describe("format-id", () => {
  it("formats full Indonesian dates", () => {
    expect(formatDateLong("2026-08-05")).toBe("5 Agustus 2026");
  });

  it("prepends the Indonesian weekday", () => {
    expect(formatDayDateLong("2026-08-05")).toBe("Rabu, 5 Agustus 2026");
    expect(formatDayDateLong("2026-08-10")).toBe("Senin, 10 Agustus 2026");
  });

  it("falls back to the raw value for invalid keys", () => {
    expect(formatDayDateLong("not-a-date")).toBe("not-a-date");
    expect(formatDateLong("not-a-date")).toBe("not-a-date");
  });
});
