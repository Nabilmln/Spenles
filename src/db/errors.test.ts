import { describe, expect, it } from "vitest";
import { hasPostgresErrorCode } from "./errors";

describe("hasPostgresErrorCode", () => {
  it("recognizes a direct PostgreSQL error code", () => {
    expect(hasPostgresErrorCode({ code: "23505" }, "23505")).toBe(true);
  });

  it("recognizes a code wrapped by Drizzle through cause", () => {
    const error = new Error("Failed query", {
      cause: { code: "23505" },
    });

    expect(hasPostgresErrorCode(error, "23505")).toBe(true);
  });

  it("recognizes a nested source error", () => {
    expect(
      hasPostgresErrorCode(
        { cause: { sourceError: { code: "23505" } } },
        "23505",
      ),
    ).toBe(true);
  });

  it("rejects another code and handles circular causes", () => {
    const error: { code: string; cause?: unknown } = { code: "23503" };
    error.cause = error;

    expect(hasPostgresErrorCode(error, "23505")).toBe(false);
  });
});
