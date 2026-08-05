import { describe, expect, it } from "vitest";
import {
  calculateBudgetMetrics,
  formatPercentageBps,
} from "./budget-metrics";

describe("budget metrics", () => {
  it("classifies exact threshold and exact 100% as warning", () => {
    expect(calculateBudgetMetrics(100n, 79n, 8000).status).toBe("safe");
    expect(calculateBudgetMetrics(100n, 80n, 8000).status).toBe("warning");
    expect(calculateBudgetMetrics(100n, 100n, 8000).status).toBe("warning");
  });

  it("classifies over-budget usage and allows negative remaining", () => {
    const metrics = calculateBudgetMetrics(100n, 101n, 8000);
    expect(metrics.status).toBe("exceeded");
    expect(metrics.remaining).toBe(-1n);
  });

  it("rounds percentage half-up to two decimals without floating point", () => {
    expect(formatPercentageBps(calculateBudgetMetrics(3n, 1n, 8000).percentageBps)).toBe(
      "33,33%",
    );
  });
});
