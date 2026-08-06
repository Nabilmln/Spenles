import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  getPersonalDataBackupJson: vi.fn(),
  getPersonalDataBackupRecordCount: vi.fn(),
}));

vi.mock("@/lib/auth/require-session", () => ({
  getSessionUser: mocks.getSessionUser,
}));
vi.mock("@/modules/reports/queries/backup-query", () => ({
  getPersonalDataBackupJson: mocks.getPersonalDataBackupJson,
  getPersonalDataBackupRecordCount: mocks.getPersonalDataBackupRecordCount,
}));

import { GET } from "./route";

describe("GET /api/exports/backup", () => {
  beforeEach(() => {
    mocks.getSessionUser.mockResolvedValue({ id: "user-a" });
    mocks.getPersonalDataBackupRecordCount.mockResolvedValue(5);
    mocks.getPersonalDataBackupJson.mockResolvedValue(
      JSON.stringify({
        schemaVersion: "1.0",
        application: "Spenles",
        data: { profile: { displayName: "User A" } },
      }),
    );
  });

  it("requires authentication before loading backup data", async () => {
    mocks.getSessionUser.mockResolvedValue(null);
    const response = await GET(
      new Request("http://localhost/api/exports/backup"),
    );
    expect(response.status).toBe(401);
    expect(mocks.getPersonalDataBackupJson).not.toHaveBeenCalled();
  });

  it("derives ownership from the session and returns versioned private JSON", async () => {
    const response = await GET(
      new Request("http://localhost/api/exports/backup"),
    );
    expect(response.status).toBe(200);
    expect(mocks.getPersonalDataBackupJson).toHaveBeenCalledWith(
      "user-a",
      expect.any(Date),
    );
    const body = await response.json();
    expect(body.schemaVersion).toBe("1.0");
    expect(JSON.stringify(body)).not.toMatch(
      /password|session|token|secret|credential/iu,
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toMatch(
      /spenles-backup-\d{4}-\d{2}-\d{2}\.json/u,
    );
  });

  it("rejects unknown query parameters", async () => {
    const response = await GET(
      new Request("http://localhost/api/exports/backup?userId=other-user"),
    );
    expect(response.status).toBe(400);
    expect(mocks.getPersonalDataBackupJson).not.toHaveBeenCalled();
  });

  it("rejects an oversized backup before building its JSON snapshot", async () => {
    mocks.getPersonalDataBackupRecordCount.mockResolvedValue(25_001);
    const response = await GET(
      new Request("http://localhost/api/exports/backup"),
    );
    expect(response.status).toBe(422);
    expect(mocks.getPersonalDataBackupJson).not.toHaveBeenCalled();
  });
});
