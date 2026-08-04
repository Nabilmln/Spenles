import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const validProfile = {
  displayName: "Sari",
  defaultCurrency: "IDR",
  timezone: "Asia/Jakarta",
  theme: "system",
};

describe("profileSchema", () => {
  it("accepts Phase 01 defaults", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects unsupported currency, timezone, and theme", () => {
    expect(
      profileSchema.safeParse({
        ...validProfile,
        defaultCurrency: "USD",
        timezone: "UTC",
        theme: "blue",
      }).success,
    ).toBe(false);
  });
});
