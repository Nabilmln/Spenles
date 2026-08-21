import { JAKARTA_TIMEZONE } from "./jakarta";

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/u;
const DAY_MS = 86_400_000;

export type DateParts = { year: number; month: number; day: number };

export function parseDateKey(value: string): DateParts | null {
  const match = DATE_KEY.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function isDateKey(value: string) {
  return parseDateKey(value) !== null;
}

function iso(parts: DateParts) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function isReportDate(value: string) {
  return isDateKey(value);
}

export function isValidReportRange(from: string, to: string, maxDays = 366) {
  const start = parseDateKey(from);
  const end = parseDateKey(to);
  if (!start || !end) return false;
  const diff = Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      DAY_MS,
  );
  return diff >= 0 && diff < maxDays;
}

export function inclusiveDayCount(from: string, to: string) {
  const start = parseDateKey(from);
  const end = parseDateKey(to);
  if (!start || !end) return 0;
  return (
    Math.round(
      (Date.UTC(end.year, end.month - 1, end.day) -
        Date.UTC(start.year, start.month - 1, start.day)) /
        DAY_MS,
    ) + 1
  );
}

export function addCalendarDays(value: string, days: number) {
  const parts = parseDateKey(value);
  if (!parts) return null;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return iso({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
}

export function todayJakartaDate(now: Date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export type CalendarDay = {
  date: string;
  day: number;
} | null;

/**
 * Builds a calendar-month grid starting on a Monday, one entry per cell
 * (null for leading/trailing blanks). Date strings are calendar-only ISO.
 */
export function buildMonthGrid(
  year: number,
  month: number,
): CalendarDay[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayIndex = (firstWeekday + 6) % 7;
  const count = daysInMonth(year, month);
  const pad = (value: number) => String(value).padStart(2, "0");
  const cells: CalendarDay[] = [];
  for (let i = 0; i < mondayIndex; i += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push({ date: `${year}-${pad(month)}-${pad(day)}`, day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function monthShift(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}
