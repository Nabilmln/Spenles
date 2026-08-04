import { describe, expect, it } from "vitest";
import { calculateExpression } from "./calculator";

describe("calculateExpression", () => {
  it.each([
    ["25000 + 18000 + 7500", "50500"],
    ["2 + 3 * 4", "14"],
    ["(2 + 3) * 4", "20"],
    ["10 / 4", "3"],
    ["5 / 2", "3"],
    ["4 / 3", "1"],
    ["--5", "5"],
  ])("calculates %s", (expression, result) => {
    expect(calculateExpression(expression)).toBe(result);
  });

  it.each([
    "",
    "1 / 0",
    "0",
    "-1",
    "1 +",
    "1.5 + 2",
    "alert(1)",
    "(1 + 2",
    "9007199254740992",
  ])("rejects unsafe expression %s", (expression) => {
    expect(() => calculateExpression(expression)).toThrow();
  });

  it("limits nesting depth", () => {
    expect(() => calculateExpression("(((((((((((1)))))))))))")).toThrow("Kurung terlalu dalam");
  });
});
