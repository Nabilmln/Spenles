import { describe, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
}));

vi.mock("./server", () => ({ auth: { getSession } }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { getSessionUser } from "./require-session";

describe("render-time session read", () => {
  it("asks Neon Auth to avoid refreshing cookies", async () => {
    await expect(getSessionUser()).resolves.toEqual({ id: "user-1" });
    expect(getSession).toHaveBeenCalledWith({
      query: { disableRefresh: "true" },
    });
  });
});
