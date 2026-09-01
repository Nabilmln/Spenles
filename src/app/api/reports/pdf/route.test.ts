import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  getProfile: vi.fn(),
  validateOwnedReportFilters: vi.fn(),
  getFinancialReport: vi.fn(),
  renderFinancialReportPdf: vi.fn(),
}));

vi.mock("@/lib/auth/require-session", () => ({
  getSessionUser: mocks.getSessionUser,
}));
vi.mock("@/modules/profiles", () => ({ getProfile: mocks.getProfile }));
vi.mock("@/modules/reports/queries/report-queries", () => ({
  validateOwnedReportFilters: mocks.validateOwnedReportFilters,
  getFinancialReport: mocks.getFinancialReport,
}));
vi.mock("@/modules/reports/services/pdf", () => ({
  renderFinancialReportPdf: mocks.renderFinancialReportPdf,
}));

import { ExportLimitError } from "@/modules/reports/services/csv";
import { GET } from "./route";

describe("GET /api/reports/pdf", () => {
  beforeEach(() => {
    mocks.getSessionUser.mockResolvedValue({ id: "user-a" });
    mocks.validateOwnedReportFilters.mockResolvedValue(true);
    mocks.getProfile.mockResolvedValue({ displayName: "User A" });
    mocks.getFinancialReport.mockResolvedValue({ report: true });
    mocks.renderFinancialReportPdf.mockResolvedValue(
      Buffer.from("%PDF-test", "utf8"),
    );
  });

  it("returns 401 without querying private data", async () => {
    mocks.getSessionUser.mockResolvedValue(null);
    const response = await GET(
      new Request("http://localhost/api/reports/pdf?period=month&month=2026-08"),
    );
    expect(response.status).toBe(401);
    expect(mocks.getFinancialReport).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it.each([
    ["period=month&month=2026-08", "spenles-report-2026-08.pdf"],
    ["period=year&year=2025", "spenles-report-2025.pdf"],
    [
      "period=custom&from=2026-08-01&to=2026-08-05",
      "spenles-report-2026-08-01-to-2026-08-05.pdf",
    ],
  ])(
    "uses the server session identity for %s",
    async (query, expectedFileName) => {
    const response = await GET(
      new Request(`http://localhost/api/reports/pdf?${query}`),
    );
    expect(response.status).toBe(200);
    expect(mocks.validateOwnedReportFilters).toHaveBeenCalledWith(
      "user-a",
      expect.any(Object),
    );
    expect(mocks.getFinancialReport).toHaveBeenCalledWith(
      "user-a",
      "User A",
      expect.any(Object),
    );
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain(
      expectedFileName,
    );
    },
  );

  it("returns the same safe validation error for a foreign filter", async () => {
    mocks.validateOwnedReportFilters.mockResolvedValue(false);
    const response = await GET(
      new Request(
        "http://localhost/api/reports/pdf?period=month&month=2026-08&account=123e4567-e89b-42d3-a456-426614174000",
      ),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid report parameters.",
    });
  });

  it("rejects a report with too many detail rows at the 500-row limit", async () => {
    mocks.getFinancialReport.mockRejectedValue(
      new ExportLimitError("Report details exceed the 500-transaction limit."),
    );
    const response = await GET(
      new Request("http://localhost/api/reports/pdf?period=month&month=2026-08"),
    );
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "Report details exceed the 500-transaction limit.",
    });
  });
});
