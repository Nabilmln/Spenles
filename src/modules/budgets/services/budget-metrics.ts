export type BudgetStatus = "safe" | "warning" | "exceeded";

export type BudgetWarningRule =
  | { type: "threshold"; thresholdBps: number }
  | { type: "days"; daysRemaining: number };

export type BudgetMetricsInput = {
  amount: bigint;
  usage: bigint;
  warning: BudgetWarningRule;
  daysRemainingInPeriod: number | null;
};

function divideHalfUp(numerator: bigint, denominator: bigint) {
  return (numerator + denominator / 2n) / denominator;
}

export function calculateBudgetMetrics({
  amount,
  usage,
  warning,
  daysRemainingInPeriod,
}: BudgetMetricsInput) {
  if (amount <= 0n) throw new Error("Jumlah anggaran harus positif.");
  if (warning.type === "threshold") {
    if (
      !Number.isInteger(warning.thresholdBps) ||
      warning.thresholdBps < 100 ||
      warning.thresholdBps > 10_000
    ) {
      throw new Error("Ambang anggaran tidak valid.");
    }
  } else if (
    ![1, 3, 5].includes(warning.daysRemaining)
  ) {
    throw new Error("Sisa hari anggaran tidak valid.");
  }

  let status: BudgetStatus = "safe";
  if (usage > amount) {
    status = "exceeded";
  } else if (warning.type === "threshold") {
    if (usage * 10_000n >= amount * BigInt(warning.thresholdBps)) {
      status = "warning";
    }
  } else if (
    usage > 0n &&
    daysRemainingInPeriod !== null &&
    daysRemainingInPeriod >= 0 &&
    daysRemainingInPeriod < warning.daysRemaining
  ) {
    status = "warning";
  }

  return {
    amount,
    usage,
    remaining: amount - usage,
    percentageBps: divideHalfUp(usage * 10_000n, amount),
    status,
  };
}

export function formatPercentageBps(value: bigint) {
  const whole = value / 100n;
  const fraction = value % 100n;
  return fraction === 0n
    ? `${whole}%`
    : `${whole},${fraction.toString().padStart(2, "0").replace(/0$/u, "")}%`;
}