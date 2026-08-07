import { describe, expect, it } from "vitest";
import { transactionSchema } from "./transaction";

const valid = {
  type: "expense" as const,
  amount: "15000",
  accountId: "11111111-1111-4111-8111-111111111111",
  categoryId: "22222222-2222-4222-8222-222222222222",
  transactionAt: "2025-01-02",
  note: " makan siang ",
};

describe("transaction validation", () => {
  it("accepts safe input and trims the note", () => {
    const result = transactionSchema.parse(valid);
    expect(result.note).toBe("makan siang");
  });

  it("turns an empty note into null", () => {
    expect(transactionSchema.parse({ ...valid, note: " " }).note).toBeNull();
  });

  it.each(["0", "-1", "1.5", "9007199254740992"])("rejects amount %s", (amount) => {
    expect(transactionSchema.safeParse({ ...valid, amount }).success).toBe(false);
  });

  it("rejects invalid ownership identifiers", () => {
    expect(transactionSchema.safeParse({ ...valid, accountId: "mine" }).success).toBe(false);
  });

  it("rejects impossible Jakarta dates", () => {
    expect(transactionSchema.safeParse({ ...valid, transactionAt: "2025-02-30" }).success).toBe(false);
  });

  it("rejects a future calendar date", () => {
    expect(transactionSchema.safeParse({ ...valid, transactionAt: "2999-12-31" }).success).toBe(false);
  });

  it("rejects notes over 500 characters", () => {
    expect(transactionSchema.safeParse({ ...valid, note: "x".repeat(501) }).success).toBe(false);
  });
});
