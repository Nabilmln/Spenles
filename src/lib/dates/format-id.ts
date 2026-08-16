export const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const WEEKDAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/u;

type DateParts = { year: number; month: number; day: number };

function parseDateParts(value: string): DateParts | null {
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

/**
 * Formats a calendar-only ISO date string as a full Indonesian date.
 * "2026-08-05" -> "5 Agustus 2026".
 */
export function formatDateLong(value: string) {
  const parts = parseDateParts(value);
  if (!parts) return value;
  return `${parts.day} ${MONTHS_LONG[parts.month - 1]} ${parts.year}`;
}

/**
 * Formats a calendar-only ISO date string as weekday and full Indonesian date.
 * "2026-08-05" -> "Rabu, 5 Agustus 2026".
 */
export function formatDayDateLong(value: string) {
  const parts = parseDateParts(value);
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
  const parts = parseDateParts(value);
  if (!parts) return value;
  return `${parts.day} ${MONTHS_LONG[parts.month - 1]}`;
}

/**
 * Formats an inclusive ISO date range using full Indonesian month names.
 * Same year:  "1 Agustus – 7 Agustus 2026"
 * Cross year: "20 Desember 2026 – 10 Januari 2027"
 */
export function formatRangeLong(from: string, to: string) {
  const start = parseDateParts(from);
  const end = parseDateParts(to);
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
