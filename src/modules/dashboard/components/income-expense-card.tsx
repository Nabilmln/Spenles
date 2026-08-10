import { formatIdr } from "@/lib/money/format-idr";
import type { IncomeExpensePoint } from "../types/dashboard";
import { AccessibleChartTable } from "./accessible-chart-table";
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
      description="Pemasukan dan pengeluaran per bulan pada rentang grafik."
      summary={`Total pemasukan ${formatIdr(totalIncome)} · Total pengeluaran ${formatIdr(totalExpense)}`}
      table={
        <AccessibleChartTable
          caption="Pemasukan dan pengeluaran per bulan"
          columns={[
            { key: "month", label: "Bulan" },
            { key: "income", label: "Pemasukan", align: "right" },
            { key: "expense", label: "Pengeluaran", align: "right" },
          ]}
          rows={points.map((point) => ({
            id: point.period,
            month: point.label,
            income: formatIdr(point.incomeIdr),
            expense: formatIdr(point.expenseIdr),
          }))}
        />
      }
      title="Pemasukan vs Pengeluaran"
    />
  );
}