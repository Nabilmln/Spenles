import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const { protectPage } = vi.hoisted(() => ({
  protectPage: vi.fn(async () => NextResponse.next()),
}));

vi.mock("@/lib/auth/server", () => ({
  auth: { middleware: () => protectPage },
}));

import proxy, { config } from "./proxy";

describe("protected-page session proxy", () => {
  beforeEach(() => protectPage.mockClear());

  it("checks protected page navigation through Neon Auth", async () => {
    const request = new NextRequest("https://spenles.test/transactions");

    await proxy(request);

    expect(protectPage).toHaveBeenCalledOnce();
    expect(protectPage).toHaveBeenCalledWith(request);
  });

  it("lets Server Action POSTs reach their own session checks", async () => {
    const request = new NextRequest("https://spenles.test/transactions", {
      method: "POST",
      headers: { "next-action": "action-id" },
    });

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(protectPage).not.toHaveBeenCalled();
    expect(config.matcher[0].missing).toEqual([
      { type: "header", key: "next-action" },
    ]);
  });
});
