import { describe, expect, it, vi } from "vitest";
import type { FinancialReport } from "../types";
import { renderFinancialReportPdf } from "./pdf";

function report(): FinancialReport {
  return {
    displayName: "Pengguna Uji",
    generatedAt: new Date("2026-08-06T00:00:00.000Z"),
    filters: {
      interval: {
        kind: "month",
        label: "Agustus 2026",
        filePart: "2026-08",
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        start: new Date("2026-07-31T17:00:00.000Z"),
        end: new Date("2026-08-31T17:00:00.000Z"),
      },
      includeDetails: false,
    },
    summary: { incomeIdr: "100000", expenseIdr: "25000", netIdr: "75000" },
    months: [{ month: "2026-08", incomeIdr: "100000", expenseIdr: "25000" }],
    categories: [
      { categoryId: "category-1", name: "Makan", amountIdr: "25000" },
    ],
    accounts: [
      {
        accountId: "account-1",
        name: "Kas Utama",
        type: "cash",
        openingBalanceIdr: "0",
        incomeIdr: "100000",
        expenseIdr: "25000",
        incomingTransfersIdr: "0",
        outgoingTransfersIdr: "0",
        closingBalanceIdr: "75000",
      },
    ],
    budgets: [],
    transactions: [],
  };
}

describe("PDF report rendering", () => {
  it("renders a valid PDF from authoritative report data", async () => {
    const result = await renderFinancialReportPdf(report());
    expect(result.subarray(0, 5).toString()).toBe("%PDF-");
    expect(result.byteLength).toBeGreaterThan(1_000);
  }, 20_000);

  it("renders a valid zero-data report", async () => {
    const value = report();
    value.summary = { incomeIdr: "0", expenseIdr: "0", netIdr: "0" };
    value.months = [];
    value.categories = [];
    value.accounts = [];
    const result = await renderFinancialReportPdf(value);
    expect(result.subarray(0, 5).toString()).toBe("%PDF-");
  }, 20_000);

  it("falls back to the table-only document when chart rendering fails", async () => {
    const renderer = vi
      .fn()
      .mockRejectedValueOnce(new Error("chart failed"))
      .mockResolvedValueOnce(Buffer.from("%PDF-fallback"));
    const result = await renderFinancialReportPdf(report(), renderer);
    expect(renderer).toHaveBeenCalledTimes(2);
    expect(result.toString()).toBe("%PDF-fallback");
  });
});
