import { JAKARTA_TIMEZONE } from "./jakarta-month";

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

type JakartaParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function jakartaParts(value: Date): JakartaParts {
  const parts = Object.fromEntries(
    partsFormatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function fromJakarta(parts: JakartaParts) {
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour - 7,
      parts.minute,
      parts.second,
    ),
  );
}

function addCalendarDays(anchor: JakartaParts, days: number) {
  const calendar = new Date(
    Date.UTC(anchor.year, anchor.month - 1, anchor.day + days),
  );
  return fromJakarta({
    ...anchor,
    year: calendar.getUTCFullYear(),
    month: calendar.getUTCMonth() + 1,
    day: calendar.getUTCDate(),
  });
}

export function occurrenceAtSequence(
  startAt: Date,
  frequency: RecurringFrequency,
  sequence: number,
) {
  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new Error("Urutan jadwal tidak valid.");
  }
  const anchor = jakartaParts(startAt);
  if (frequency === "daily") return addCalendarDays(anchor, sequence);
  if (frequency === "weekly") return addCalendarDays(anchor, sequence * 7);

  if (frequency === "monthly") {
    const absoluteMonth = anchor.year * 12 + (anchor.month - 1) + sequence;
    const year = Math.floor(absoluteMonth / 12);
    const month = (absoluteMonth % 12) + 1;
    return fromJakarta({
      ...anchor,
      year,
      month,
      day: Math.min(anchor.day, daysInMonth(year, month)),
    });
  }

  const year = anchor.year + sequence;
  return fromJakarta({
    ...anchor,
    year,
    day: Math.min(anchor.day, daysInMonth(year, anchor.month)),
  });
}

function localDate(value: Date) {
  const parts = jakartaParts(value);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

function sequenceEstimate(
  startAt: Date,
  frequency: RecurringFrequency,
  after: Date,
) {
  if (frequency === "daily" || frequency === "weekly") {
    const divisor = frequency === "daily" ? 86_400_000 : 604_800_000;
    return Math.max(0, Math.floor((after.getTime() - startAt.getTime()) / divisor) - 1);
  }
  const start = jakartaParts(startAt);
  const target = jakartaParts(after);
  if (frequency === "monthly") {
    return Math.max(
      0,
      (target.year - start.year) * 12 + target.month - start.month - 1,
    );
  }
  return Math.max(0, target.year - start.year - 1);
}

export function firstOccurrenceAfter(
  startAt: Date,
  frequency: RecurringFrequency,
  after: Date,
  endDate: string | null = null,
) {
  let sequence = sequenceEstimate(startAt, frequency, after);
  for (let guard = 0; guard < 4; guard += 1) {
    const candidate = occurrenceAtSequence(startAt, frequency, sequence);
    if (candidate.getTime() > after.getTime()) {
      return endDate && localDate(candidate) > endDate ? null : candidate;
    }
    sequence += 1;
  }
  throw new Error("Jadwal berikutnya tidak dapat dihitung.");
}

export function initialOccurrence(
  startAt: Date,
  frequency: RecurringFrequency,
  now: Date,
  endDate: string | null = null,
) {
  if (startAt.getTime() > now.getTime()) {
    return endDate && localDate(startAt) > endDate ? null : startAt;
  }
  return firstOccurrenceAfter(startAt, frequency, now, endDate);
}

export function jakartaCalendarDate(value: Date) {
  return localDate(value);
}
