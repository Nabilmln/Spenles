import { buildDailyCashFlowContract } from "@/modules/dashboard/services/chart-contracts";
import type { DateInterval } from "@/modules/dashboard/types/dashboard";

type DailyCashFlow = { period: string; income: bigint; expense: bigint };

export function buildMonthlyExpenseOverview(
  interval: DateInterval,
  rows: DailyCashFlow[],
) {
  return buildDailyCashFlowContract(interval, rows);
}
