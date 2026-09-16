import { describe, expect, it } from "vitest";
import {
  calculateBudgetMetrics,
  formatPercentageBps,
} from "./budget-metrics";

const threshold = { type: "threshold" as const, thresholdBps: 8000 };

describe("budget metrics", () => {
  it("classifies exact threshold and exact 100% as warning", () => {
    const metrics = (usage: bigint) =>
      calculateBudgetMetrics({
        amount: 100n,
        usage,
        warning: threshold,
        daysRemainingInPeriod: 10,
      });
    expect(metrics(79n).status).toBe("safe");
    expect(metrics(80n).status).toBe("warning");
    expect(metrics(100n).status).toBe("warning");
  });

  it("classifies over-budget usage and allows negative remaining", () => {
    const metrics = calculateBudgetMetrics({
      amount: 100n,
      usage: 101n,
      warning: threshold,
      daysRemainingInPeriod: 10,
    });
    expect(metrics.status).toBe("exceeded");
    expect(metrics.remaining).toBe(-1n);
  });

  it("warns by days remaining only when usage is above zero", () => {
    const days = { type: "days" as const, daysRemaining: 3 };
    const used = calculateBudgetMetrics({
      amount: 100n,
      usage: 20n,
      warning: days,
      daysRemainingInPeriod: 2,
    });
    const untouched = calculateBudgetMetrics({
      amount: 100n,
      usage: 0n,
      warning: days,
      daysRemainingInPeriod: 2,
    });
    const notClose = calculateBudgetMetrics({
      amount: 100n,
      usage: 20n,
      warning: days,
      daysRemainingInPeriod: 5,
    });
    expect(used.status).toBe("warning");
    expect(untouched.status).toBe("safe");
    expect(notClose.status).toBe("safe");
  });

  it("treats the last day as within a days-left warning", () => {
    const days = { type: "days" as const, daysRemaining: 1 };
    const onLastDay = calculateBudgetMetrics({
      amount: 100n,
      usage: 5n,
      warning: days,
      daysRemainingInPeriod: 0,
    });
    expect(onLastDay.status).toBe("warning");
  });

  it("rounds percentage half-up to two decimals without floating point", () => {
    const metrics = calculateBudgetMetrics({
      amount: 3n,
      usage: 1n,
      warning: threshold,
      daysRemainingInPeriod: 10,
    });
    expect(formatPercentageBps(metrics.percentageBps)).toBe("33,33%");
  });
});