import { formatIdr } from "@/lib/money/format-idr";
import type { IncomeExpensePoint } from "../types/dashboard";
import { ChartShell } from "./chart-shell";
import { IncomeExpenseChart } from "./income-expense-chart";

export function IncomeExpenseCard({
  totalExpense,
  totalIncome,
  points,
}: {
  points: IncomeExpensePoint[];
  totalIncome: bigint;
  totalExpense: bigint;
}) {
  return (
    <ChartShell
      chart={<IncomeExpenseChart points={points} />}
      summary={`Total pemasukan ${formatIdr(totalIncome)} · Total pengeluaran ${formatIdr(totalExpense)}`}
      title="Pemasukan vs Pengeluaran"
    />
  );
}