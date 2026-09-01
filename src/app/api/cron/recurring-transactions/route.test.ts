import { beforeEach, describe, expect, it, vi } from "vitest";

const { secret, runRecurringScheduler, env } = vi.hoisted(() => ({
  secret: "12345678901234567890123456789012",
  runRecurringScheduler: vi.fn(),
  env: { CRON_SECRET: undefined as string | undefined },
}));

vi.mock("@/lib/env/server", () => ({
  getServerEnv: () => env,
}));
vi.mock(
  "@/modules/recurring-transactions/services/run-scheduler",
  () => ({ runRecurringScheduler }),
);

import { GET } from "./route";

describe("recurring scheduler route", () => {
  beforeEach(() => {
    env.CRON_SECRET = secret;
    runRecurringScheduler.mockReset();
    runRecurringScheduler.mockResolvedValue({
      ok: true,
      processed: 1,
      generated: 1,
      blocked: 0,
      duplicates: 0,
      failed: 0,
      hasMore: false,
    });
  });

  it("rejects missing and incorrect credentials without running work", async () => {
    for (const authorization of [undefined, "Bearer wrong"]) {
      const response = await GET(
        new Request("https://example.com/api/cron/recurring-transactions", {
          headers: authorization ? { authorization } : undefined,
        }),
      );
      expect(response.status).toBe(401);
    }
    expect(runRecurringScheduler).not.toHaveBeenCalled();
  });

  it("fails closed when CRON_SECRET is not configured", async () => {
    env.CRON_SECRET = undefined;
    const response = await GET(
      new Request("https://example.com/api/cron/recurring-transactions", {
        headers: { authorization: `Bearer ${secret}` },
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Not allowed.",
    });
    expect(runRecurringScheduler).not.toHaveBeenCalled();
  });

  it("rejects query parameters", async () => {
    const response = await GET(
      new Request(
        "https://example.com/api/cron/recurring-transactions?userId=foreign",
        { headers: { authorization: `Bearer ${secret}` } },
      ),
    );
    expect(response.status).toBe(400);
    expect(runRecurringScheduler).not.toHaveBeenCalled();
  });

  it("returns only safe operational counts for the exact secret", async () => {
    const response = await GET(
      new Request("https://example.com/api/cron/recurring-transactions", {
        headers: { authorization: `Bearer ${secret}` },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      ok: true,
      processed: 1,
      generated: 1,
      blocked: 0,
      duplicates: 0,
      failed: 0,
      hasMore: false,
    });
  });
});
