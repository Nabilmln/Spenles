import { formatIdr } from "@/lib/money/format-idr";
import type { IncomeExpensePoint } from "../types/dashboard";
import { AccessibleChartTable } from "./accessible-chart-table";
import { CashFlowChart } from "./cash-flow-chart";
import { ChartShell } from "./chart-shell";

export function CashFlowOverviewCard({
  points,
  totalIncome,
  totalExpense,
}: {
  points: IncomeExpensePoint[];
  totalIncome: bigint;
  totalExpense: bigint;
}) {
  const hasData = totalIncome > 0n || totalExpense > 0n;

  return (
    <ChartShell
      chart={
        <>
          <CashFlowChart points={points} />
          {!hasData ? (
            <p
              className="m-0 -mt-[.25rem] rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.78rem] text-muted"
              role="status"
            >
              Belum ada transaksi pada periode ini.
            </p>
          ) : null}
        </>
      }
      description="Pemasukan dan pengeluaran setiap bulan pada rentang grafik terpilih."
      summary={`Total pemasukan ${formatIdr(totalIncome)} · Total pengeluaran ${formatIdr(totalExpense)}`}
      table={
        <AccessibleChartTable
          caption="Arus kas per bulan"
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
      title="Arus Kas"
    />
  );
}