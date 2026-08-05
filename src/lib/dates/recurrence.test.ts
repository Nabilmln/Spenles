import { describe, expect, it } from "vitest";
import {
  firstOccurrenceAfter,
  initialOccurrence,
  occurrenceAtSequence,
} from "./recurrence";

const jakarta = (value: string) => new Date(`${value}+07:00`);

describe("recurrence schedules", () => {
  it("advances daily and weekly using Jakarta calendar time", () => {
    const anchor = jakarta("2026-08-05T09:30:00");
    expect(occurrenceAtSequence(anchor, "daily", 1).toISOString()).toBe(
      jakarta("2026-08-06T09:30:00").toISOString(),
    );
    expect(occurrenceAtSequence(anchor, "weekly", 1).toISOString()).toBe(
      jakarta("2026-08-12T09:30:00").toISOString(),
    );
  });

  it("clamps monthly dates without drifting from the anchor", () => {
    const anchor = jakarta("2025-01-31T08:00:00");
    expect(occurrenceAtSequence(anchor, "monthly", 1).toISOString()).toBe(
      jakarta("2025-02-28T08:00:00").toISOString(),
    );
    expect(occurrenceAtSequence(anchor, "monthly", 2).toISOString()).toBe(
      jakarta("2025-03-31T08:00:00").toISOString(),
    );
  });

  it("returns a yearly leap-day anchor in leap years", () => {
    const anchor = jakarta("2024-02-29T10:15:00");
    expect(occurrenceAtSequence(anchor, "yearly", 1).toISOString()).toBe(
      jakarta("2025-02-28T10:15:00").toISOString(),
    );
    expect(occurrenceAtSequence(anchor, "yearly", 4).toISOString()).toBe(
      jakarta("2028-02-29T10:15:00").toISOString(),
    );
  });

  it("honors an inclusive Jakarta end date", () => {
    const anchor = jakarta("2026-08-01T09:00:00");
    expect(
      firstOccurrenceAfter(
        anchor,
        "daily",
        jakarta("2026-08-02T09:00:00"),
        "2026-08-03",
      )?.toISOString(),
    ).toBe(jakarta("2026-08-03T09:00:00").toISOString());
    expect(
      firstOccurrenceAfter(
        anchor,
        "daily",
        jakarta("2026-08-03T09:00:00"),
        "2026-08-03",
      ),
    ).toBeNull();
  });

  it("selects a future start or first strictly future occurrence", () => {
    const anchor = jakarta("2026-08-01T09:00:00");
    expect(
      initialOccurrence(anchor, "weekly", jakarta("2026-07-01T00:00:00")),
    ).toEqual(anchor);
    expect(
      initialOccurrence(anchor, "weekly", jakarta("2026-08-08T09:00:00")),
    ).toEqual(jakarta("2026-08-15T09:00:00"));
  });
});
