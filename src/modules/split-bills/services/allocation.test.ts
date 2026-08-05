import { describe, expect, it } from "vitest";
import {
  allocateLargestRemainder,
  calculateBasisPointAmount,
} from "./allocation";

describe("split-bill allocation", () => {
  it("uses half-up rounding for basis-point totals", () => {
    expect(calculateBasisPointAmount(10_005n, 5_000)).toBe(5_003n);
    expect(calculateBasisPointAmount(1n, 5_000)).toBe(1n);
  });

  it("reconciles a fractional equal allocation", () => {
    const rows = allocateLargestRemainder(10_001n, [
      { id: "b", position: 2, weight: 1n },
      { id: "a", position: 1, weight: 1n },
    ]);
    expect(rows.map(({ amount }) => amount)).toEqual([5_000n, 5_001n]);
    expect(rows.reduce((sum, row) => sum + row.amount, 0n)).toBe(10_001n);
  });

  it("uses UUID lexical order after a position tie", () => {
    const rows = allocateLargestRemainder(1n, [
      { id: "b", position: 1, weight: 1n },
      { id: "a", position: 1, weight: 1n },
    ]);
    expect(rows.find(({ id }) => id === "a")?.amount).toBe(1n);
  });

  it("rejects positive targets without positive weight", () => {
    expect(() =>
      allocateLargestRemainder(1n, [
        { id: "a", position: 1, weight: 0n },
      ]),
    ).toThrow("bobot positif");
  });
});
