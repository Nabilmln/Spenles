import { buildDailyCashFlowContract } from "@/modules/dashboard/services/chart-contracts";
import type { DateInterval } from "@/modules/dashboard/types/dashboard";

type DailyCashFlow = { period: string; income: bigint; expense: bigint };

export function buildMonthlyExpenseOverview(
  interval: DateInterval,
  rows: DailyCashFlow[],
  asOfDate: string,
) {
  const contract = buildDailyCashFlowContract(
    interval,
    rows.filter((row) => row.period <= asOfDate),
  );
  let runningExpense = 0n;
  const points = contract.points.map((point) => {
    runningExpense += BigInt(point.expenseIdr);
    return {
      ...point,
      expenseIdr: runningExpense.toString(),
      expensePlot: contract.totalExpense === 0n
        ? 0
        : Number((runningExpense * 10_000n) / contract.totalExpense) / 10_000,
    };
  });

  return { ...contract, points };
}
