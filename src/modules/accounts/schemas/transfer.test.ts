import { describe, expect, it } from "vitest";
import { transferSchema } from "./transfer";

const first = "11111111-1111-4111-8111-111111111111";
const second = "22222222-2222-4222-8222-222222222222";

describe("transferSchema", () => {
  it("accepts two distinct accounts", () => {
    expect(
      transferSchema.safeParse({
        sourceAccountId: first,
        destinationAccountId: second,
        amount: "1000",
        transferredAt: "2026-08-05T12:00",
        note: "",
      }).success,
    ).toBe(true);
  });

  it("rejects identical accounts and invalid money", () => {
    expect(
      transferSchema.safeParse({
        sourceAccountId: first,
        destinationAccountId: first,
        amount: "0",
        transferredAt: "2026-08-05T12:00",
        note: "",
      }).success,
    ).toBe(false);
  });
});
