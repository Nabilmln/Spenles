import { describe, expect, it } from "vitest";
import { moneyString } from "./schema";

describe("moneyString", () => {
  const schema = moneyString();

  it("accepts valid positive rupiah", () => {
    expect(schema.safeParse("15000").success).toBe(true);
    expect(schema.safeParse(" 15000 ").success).toBe(true);
    expect(schema.safeParse("9007199254740991").success).toBe(true);
  });

  it("rejects invalid input", () => {
    expect(schema.safeParse("abc").success).toBe(false);
    expect(schema.safeParse("1.5").success).toBe(false);
    expect(schema.safeParse("-1").success).toBe(false);
    expect(schema.safeParse("9007199254740992").success).toBe(false);
  });

  it("rejects zero by default", () => {
    expect(schema.safeParse("0").success).toBe(false);
  });

  it("allows zero when configured", () => {
    expect(moneyString({ allowZero: true }).safeParse("0").success).toBe(true);
  });

  it("rejects leading zeros by default but allows them when configured", () => {
    expect(schema.safeParse("007").success).toBe(false);
    expect(moneyString({ allowLeadingZeros: true }).safeParse("007").success).toBe(true);
  });

  it("enforces a custom max", () => {
    const limited = moneyString({ max: 100n });
    expect(limited.safeParse("100").success).toBe(true);
    expect(limited.safeParse("101").success).toBe(false);
  });

  it("uses the configured error messages", () => {
    const custom = moneyString({
      formatMessage: "Format salah.",
      rangeMessage: "Melebihi batas.",
    });
    expect(custom.safeParse("abc").error?.issues[0]?.message).toBe("Format salah.");
    expect(custom.safeParse("9007199254740992").error?.issues[0]?.message).toBe("Melebihi batas.");
  });
});