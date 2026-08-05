import { describe, expect, it } from "vitest";
import { calculateAccountBalance } from "./account-balance";

describe("calculateAccountBalance", () => {
  it("reconciles transactions and both transfer directions exactly", () => {
    expect(
      calculateAccountBalance({
        openingBalance: 100n,
        income: 50n,
        expense: 200n,
        incomingTransfers: 25n,
        outgoingTransfers: 10n,
      }),
    ).toBe(-35n);
  });

  it("keeps bigint precision beyond Number safe aggregate precision", () => {
    expect(
      calculateAccountBalance({
        openingBalance: 9_007_199_254_740_991n,
        income: 9_007_199_254_740_991n,
        expense: 0n,
        incomingTransfers: 1n,
        outgoingTransfers: 0n,
      }),
    ).toBe(18_014_398_509_481_983n);
  });
});
