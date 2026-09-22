import { JAKARTA_TIMEZONE } from "@/lib/dates/jakarta";

export const REPORT_TIMEZONE = JAKARTA_TIMEZONE;
export const REPORT_CURRENCY = "IDR";
export const REPORT_EARLIEST_DATE = "2000-01-01";
export const REPORT_MAX_DAYS = 366;
export const REPORT_DETAIL_LIMIT = 500;
export const EXPORT_MAX_BYTES = 3_500_000;
export const BACKUP_RECORD_LIMIT = 25_000;
export const BACKUP_SCHEMA_VERSION = "1.0";

export const PRIVATE_EXPORT_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
} as const;

export const PRIVATE_PREVIEW_HEADERS = {
  "Cache-Control": "private, max-age=300",
  "X-Content-Type-Options": "nosniff",
} as const;
