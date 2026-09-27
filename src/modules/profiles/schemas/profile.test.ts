import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const validProfile = {
  displayName: "Sari",
  defaultCurrency: "IDR",
  timezone: "Asia/Jakarta",
};

describe("profileSchema", () => {
  it("accepts supported profile settings", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects unsupported currency and timezone", () => {
    expect(profileSchema.safeParse({ ...validProfile, defaultCurrency: "USD", timezone: "UTC" }).success).toBe(false);
  });
});
