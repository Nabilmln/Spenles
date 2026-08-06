import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  validateOwnedReportFilters: vi.fn(),
  listCsvTransactions: vi.fn(),
}));

vi.mock("@/lib/auth/require-session", () => ({
  getSessionUser: mocks.getSessionUser,
}));
vi.mock("@/modules/reports/queries/report-queries", () => ({
  validateOwnedReportFilters: mocks.validateOwnedReportFilters,
  listCsvTransactions: mocks.listCsvTransactions,
}));

import { GET } from "./route";

describe("GET /api/exports/transactions.csv", () => {
  beforeEach(() => {
    mocks.getSessionUser.mockResolvedValue({ id: "user-a" });
    mocks.validateOwnedReportFilters.mockResolvedValue(true);
    mocks.listCsvTransactions.mockResolvedValue([]);
  });

  it("requires authentication", async () => {
    mocks.getSessionUser.mockResolvedValue(null);
    const response = await GET(
      new Request(
        "http://localhost/api/exports/transactions.csv?period=month&month=2026-08",
      ),
    );
    expect(response.status).toBe(401);
    expect(mocks.listCsvTransactions).not.toHaveBeenCalled();
  });

  it("uses only the session user and emits a header-only private CSV", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/exports/transactions.csv?period=month&month=2026-08",
      ),
    );
    expect(response.status).toBe(200);
    expect(mocks.listCsvTransactions).toHaveBeenCalledWith(
      "user-a",
      expect.any(Object),
      10_001,
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toContain(
      "spenles-transactions-2026-08.csv",
    );
    expect(await response.text()).toContain('"transaction_id"');
  });
});
