import { parseDateKey } from "./calendar";

export const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Formats a calendar-only ISO date string as a full Indonesian date.
 * "2026-08-05" -> "5 Agustus 2026".
 */
export function formatDateLong(value: string) {
  const parts = parseDateKey(value);
  if (!parts) return value;
  return `${parts.day} ${MONTHS_LONG[parts.month - 1]} ${parts.year}`;
}

/**
 * Formats a calendar-only ISO date string as weekday and full Indonesian date.
 * "2026-08-05" -> "Rabu, 5 Agustus 2026".
 */
export function formatDayDateLong(value: string) {
  const parts = parseDateKey(value);
  if (!parts) return value;
  const weekday = WEEKDAYS[
    new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
  ];
  return `${weekday}, ${formatDateLong(value)}`;
}

/**
 * Formats a calendar-only ISO date string without the year.
 * "2026-08-05" -> "5 Agustus".
 */
export function formatDateLongNoYear(value: string) {
  const parts = parseDateKey(value);
  if (!parts) return value;
  return `${parts.day} ${MONTHS_LONG[parts.month - 1]}`;
}

/**
 * Formats an inclusive ISO date range using full Indonesian month names.
 * Same year:  "1 Agustus – 7 Agustus 2026"
 * Cross year: "20 Desember 2026 – 10 Januari 2027"
 */
export function formatRangeLong(from: string, to: string) {
  const start = parseDateKey(from);
  const end = parseDateKey(to);
  if (!start || !end) return `${from} – ${to}`;
  if (from === to) return formatDateLong(from);
  if (start.year === end.year) {
    return `${formatDateLongNoYear(from)} – ${formatDateLong(to)}`;
  }
  return `${formatDateLong(from)} – ${formatDateLong(to)}`;
}

/**
 * Formats a calendar month as a full Indonesian month and year.
 * (2026, 8) -> "Agustus 2026".
 */
export function formatMonthYearLabel(year: number, month: number) {
  return `${MONTHS_LONG[month - 1]} ${year}`;
}
