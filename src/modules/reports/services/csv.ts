import {
  CSV_ROW_LIMIT,
  EXPORT_MAX_BYTES,
  REPORT_TIMEZONE,
} from "../constants";
import type { ReportTransaction } from "../types";

export const CSV_HEADERS = [
  "transaction_id",
  "transaction_date",
  "transaction_time",
  "transaction_type",
  "category",
  "account",
  "amount_idr",
  "note",
  "created_at",
  "updated_at",
] as const;

export class ExportLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportLimitError";
  }
}

export function sanitizeSpreadsheetText(value: string) {
  if (/^[\t\r\n]/u.test(value) || /^\s*[=+\-@]/u.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function encodeCsvCell(value: string) {
  return `"${value.replace(/"/gu, '""')}"`;
}

function formatDatePart(value: Date, part: "date" | "time") {
  const options: Intl.DateTimeFormatOptions =
    part === "date"
      ? { year: "numeric", month: "2-digit", day: "2-digit" }
      : {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        };
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: REPORT_TIMEZONE,
    ...options,
  }).format(value);
}

export function serializeTransactionsCsv(rows: ReportTransaction[]) {
  if (rows.length > CSV_ROW_LIMIT) {
    throw new ExportLimitError(
      `Ekspor melebihi batas ${CSV_ROW_LIMIT.toLocaleString("id-ID")} transaksi.`,
    );
  }
  const lines = [
    CSV_HEADERS.map(encodeCsvCell).join(","),
    ...rows.map((row) =>
      [
        row.id,
        formatDatePart(row.transactionAt, "date"),
        formatDatePart(row.transactionAt, "time"),
        row.type,
        sanitizeSpreadsheetText(row.categoryName),
        sanitizeSpreadsheetText(row.accountName),
        row.amountIdr,
        sanitizeSpreadsheetText(row.note ?? ""),
        row.createdAt.toISOString(),
        row.updatedAt.toISOString(),
      ]
        .map(encodeCsvCell)
        .join(","),
    ),
  ];
  const csv = `\uFEFF${lines.join("\r\n")}\r\n`;
  if (Buffer.byteLength(csv, "utf8") > EXPORT_MAX_BYTES) {
    throw new ExportLimitError("Ukuran ekspor CSV melebihi batas 3,5 MB.");
  }
  return csv;
}
