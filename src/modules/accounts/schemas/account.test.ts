import { describe, expect, it } from "vitest";
import { accountSchema } from "./account";

describe("accountSchema", () => {
  it("accepts approved types and integer opening balances", () => {
    expect(
      accountSchema.safeParse({
        name: "Bank utama",
        type: "bank",
        openingBalance: "150000",
      }).success,
    ).toBe(true);
  });

  it("rejects negative, fractional, and unsafe opening balances", () => {
    for (const openingBalance of ["-1", "1.5", "9007199254740992"]) {
      expect(
        accountSchema.safeParse({
          name: "Akun",
          type: "cash",
          openingBalance,
        }).success,
      ).toBe(false);
    }
  });
});
