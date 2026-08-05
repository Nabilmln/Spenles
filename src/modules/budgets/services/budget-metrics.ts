export type BudgetStatus = "safe" | "warning" | "exceeded";

function divideHalfUp(numerator: bigint, denominator: bigint) {
  return (numerator + denominator / 2n) / denominator;
}

export function calculateBudgetMetrics(
  amount: bigint,
  usage: bigint,
  warningThresholdBps: number,
) {
  if (amount <= 0n) throw new Error("Jumlah anggaran harus positif.");
  if (
    !Number.isInteger(warningThresholdBps) ||
    warningThresholdBps < 100 ||
    warningThresholdBps > 10_000
  ) {
    throw new Error("Ambang anggaran tidak valid.");
  }

  const status: BudgetStatus =
    usage > amount
      ? "exceeded"
      : usage * 10_000n >= amount * BigInt(warningThresholdBps)
        ? "warning"
        : "safe";

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
