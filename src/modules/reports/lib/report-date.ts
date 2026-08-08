import {
  formatDateLong,
  formatDateLongNoYear,
  formatMonthYearLabel,
  formatRangeLong,
} from "@/lib/dates/format-id";

export * from "@/lib/dates/calendar";

export function formatReportDay(value: string, includeYear: boolean) {
  return includeYear ? formatDateLong(value) : formatDateLongNoYear(value);
}

export function formatReportMonthYear(year: number, month: number) {
  return formatMonthYearLabel(year, month);
}

/**
 * Formats an inclusive ISO date range using full Indonesian month names.
 * Same year:    1 Agustus – 7 Agustus 2026
 * Cross year:   20 Desember 2026 – 10 Januari 2027
 */
export function formatReportRange(from: string, to: string) {
  return formatRangeLong(from, to);
}
