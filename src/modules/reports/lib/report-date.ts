import { formatRangeLong, formatRangeShort } from "@/lib/dates/format-id";

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
export function formatReportRangeShort(from: string, to: string) {
  return formatRangeShort(from, to);
}
