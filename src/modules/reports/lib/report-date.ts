import { formatRangeLong, MONTHS_SHORT } from "@/lib/dates/format-id";
import { parseDateKey } from "@/lib/dates/calendar";

export * from "@/lib/dates/calendar";

/**
 * Formats an inclusive ISO date range using full Indonesian month names.
 * Same year:    1 Agustus – 7 Agustus 2026
 * Cross year:   20 Desember 2026 – 10 Januari 2027
 */
export function formatReportRange(from: string, to: string) {
  return formatRangeLong(from, to);
}

/**
 * Formats an inclusive ISO date range using abbreviated month names.
 * Same year:   1 Aug – 7 Aug 2026
 * Cross year:  20 Dec 2026 – 10 Jan 2027
 */
export function formatReportDateChip(value: string) {
  const date = parseDateKey(value);
  if (!date) return value;
  return `${date.day} ${MONTHS_SHORT[date.month - 1]} ${String(date.year).slice(-2)}`;
}
