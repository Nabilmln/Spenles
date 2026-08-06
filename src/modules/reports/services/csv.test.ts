import { describe, expect, it } from "vitest";
import type { ReportTransaction } from "../types";
import {
  encodeCsvCell,
  sanitizeSpreadsheetText,
  serializeTransactionsCsv,
} from "./csv";

describe("CSV export", () => {
  it.each([
    ["=SUM(A1:A2)", "'=SUM(A1:A2)"],
    [" +1+1", "' +1+1"],
    ["-10", "'-10"],
    ["@command", "'@command"],
    ["\t=unsafe", "'\t=unsafe"],
    ["aman", "aman"],
  ])("neutralizes spreadsheet formulas in %j", (input, expected) => {
    expect(sanitizeSpreadsheetText(input)).toBe(expected);
  });

  it("uses RFC 4180 quoting", () => {
    expect(encodeCsvCell('baris "satu",\nbaris dua')).toBe(
      '"baris ""satu"",\nbaris dua"',
    );
  });

  it("emits BOM, CRLF, machine-readable rupiah, and sanitized user text", () => {
    const row: ReportTransaction = {
      id: "transaction-1",
      type: "expense",
      amountIdr: "12500",
      transactionAt: new Date("2026-08-05T18:02:03.000Z"),
      note: "=HYPERLINK(\"https://invalid\")",
      createdAt: new Date("2026-08-05T18:03:00.000Z"),
      updatedAt: new Date("2026-08-05T18:04:00.000Z"),
      accountName: "+Akun",
      categoryName: "@Kategori",
    };
    const csv = serializeTransactionsCsv([row]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("\r\n");
    expect(csv).toContain('"12500"');
    expect(csv).toContain('"\'@Kategori"');
    expect(csv).toContain('"\' +Akun"'.replace(" ", ""));
    expect(csv).toContain('"\'=HYPERLINK(""https://invalid"")"');
  });
});
