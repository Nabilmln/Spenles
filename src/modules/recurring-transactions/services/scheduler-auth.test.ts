import { describe, expect, it } from "vitest";
import { isSchedulerAuthorized } from "./scheduler-auth";

const secret = "12345678901234567890123456789012";

describe("scheduler authentication", () => {
  it("fails closed for missing configuration or header", () => {
    expect(isSchedulerAuthorized(null, secret)).toBe(false);
    expect(isSchedulerAuthorized(`Bearer ${secret}`, undefined)).toBe(false);
  });

  it("rejects an incorrect secret and accepts the exact bearer secret", () => {
    expect(isSchedulerAuthorized("Bearer wrong", secret)).toBe(false);
    expect(isSchedulerAuthorized(`Bearer ${secret}`, secret)).toBe(true);
  });
});
