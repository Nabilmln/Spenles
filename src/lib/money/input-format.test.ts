import { describe, expect, it } from "vitest";
import {
  digitsOnly,
  formatThousands,
  parseMoneyInput,
  stripLeadingZeros,
  unitPriceFromTotal,
} from "./input-format";

describe("money input formatting", () => {
  it("keeps only digits", () => {
    expect(digitsOnly("Rp1.000")).toBe("1000");
    expect(digitsOnly("abc")).toBe("");
    expect(digitsOnly("10,5")).toBe("105");
  });

  it("strips leading zeros while keeping a single zero", () => {
    expect(stripLeadingZeros("02")).toBe("2");
    expect(stripLeadingZeros("0")).toBe("0");
    expect(stripLeadingZeros("000100")).toBe("100");
    expect(stripLeadingZeros("")).toBe("");
  });

  it("formats thousands with a dot separator", () => {
    expect(formatThousands("1000")).toBe("1.000");
    expect(formatThousands("10000")).toBe("10.000");
    expect(formatThousands("1000000")).toBe("1.000.000");
    expect(formatThousands("100")).toBe("100");
    expect(formatThousands("Rp1.000")).toBe("1.000");
  });

  it("parses formatted display values back to digits", () => {
    expect(parseMoneyInput("Rp1.000")).toBe("1000");
    expect(parseMoneyInput("1.000.000")).toBe("1000000");
    expect(parseMoneyInput("1000")).toBe("1000");
  });

  it("derives an exact unit price from a divisible total", () => {
    expect(unitPriceFromTotal(50_000n, 2)).toBe(25_000n);
    expect(unitPriceFromTotal(100_000n, 1)).toBe(100_000n);
    expect(unitPriceFromTotal(0n, 5)).toBe(0n);
  });

  it("returns null when the total is not divisible or quantity invalid", () => {
    expect(unitPriceFromTotal(50_001n, 2)).toBeNull();
    expect(unitPriceFromTotal(10_000n, 3)).toBeNull();
    expect(unitPriceFromTotal(10_000n, 0)).toBeNull();
  });
});