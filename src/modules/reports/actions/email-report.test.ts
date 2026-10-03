import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSessionUser: vi.fn(async () => ({ id: "owner-1", email: "owner@example.com" })),
  getProfile: vi.fn(async () => ({ displayName: "Owner" })),
  getReportOptions: vi.fn(async () => ({
    accounts: [{ id: "11111111-1111-4111-8111-111111111111", name: "Daily account" }],
  })),
  validateOwnedReportFilters: vi.fn(async () => true),
  getFinancialReport: vi.fn(async () => ({ displayName: "Owner" })),
  renderFinancialReportPdf: vi.fn(async () => Buffer.from("pdf")),
  sendReportEmail: vi.fn(async () => undefined),
}));

vi.mock("@/lib/auth/require-session", () => ({ requireSessionUser: mocks.requireSessionUser }));
vi.mock("@/modules/profiles", () => ({ getProfile: mocks.getProfile }));
vi.mock("../queries/report-options", () => ({ getReportOptions: mocks.getReportOptions }));
vi.mock("../queries/report-queries", () => ({
  validateOwnedReportFilters: mocks.validateOwnedReportFilters,
  getFinancialReport: mocks.getFinancialReport,
}));
vi.mock("../services/pdf", () => ({ renderFinancialReportPdf: mocks.renderFinancialReportPdf }));
vi.mock("../services/report-email", () => ({
  ReportEmailConfigurationError: class extends Error {},
  sendReportEmail: mocks.sendReportEmail,
}));

import { emailReportAction } from "./email-report";

function form(accountId = "11111111-1111-4111-8111-111111111111") {
  const data = new FormData();
  data.set("email", "other@example.com");
  data.set("accountId", accountId);
  data.set("from", "2026-08-01");
  data.set("to", "2026-08-07");
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateOwnedReportFilters.mockResolvedValue(true);
});

describe("email report action", () => {
  it("rejects a foreign account before creating or sending a PDF", async () => {
    mocks.validateOwnedReportFilters.mockResolvedValue(false);

    const result = await emailReportAction({}, form("22222222-2222-4222-8222-222222222222"));

    expect(result.error).toMatch(/your accounts/u);
    expect(mocks.getFinancialReport).not.toHaveBeenCalled();
    expect(mocks.sendReportEmail).not.toHaveBeenCalled();
  });

  it("sends only after authenticated ownership and date checks", async () => {
    const result = await emailReportAction({}, form());

    expect(mocks.validateOwnedReportFilters).toHaveBeenCalledWith("owner-1", expect.objectContaining({
      accountId: "11111111-1111-4111-8111-111111111111",
      includeDetails: true,
    }));
    expect(mocks.sendReportEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "other@example.com",
      accountName: "Daily account",
    }));
    expect(result.success).toContain("other@example.com");
  });

  it("rejects invalid recipient before querying financial data", async () => {
    const data = form();
    data.set("email", "not-an-email");

    expect((await emailReportAction({}, data)).error).toMatch(/valid recipient/u);
    expect(mocks.getFinancialReport).not.toHaveBeenCalled();
  });
});
