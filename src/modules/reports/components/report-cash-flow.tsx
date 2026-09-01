import { formatIdr } from "@/lib/money/format-idr";
import { formatDateLongNoYear, formatMonthYearLabel } from "@/lib/dates/format-id";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { ChartShell, IncomeExpenseChart } from "@/modules/dashboard";
import type { ReportMonth } from "../types";

export type CashFlowPoint = {
  period: string;
  label: string;
  incomeIdr: string;
  expenseIdr: string;
  incomePlot: number;
  expensePlot: number;
};

function monthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return formatMonthYearLabel(year, month);
}

export function buildCashFlowPoints(series: ReportMonth[]): CashFlowPoint[] {
  const maximum = series.reduce((max, item) => {
    const income = BigInt(item.incomeIdr);
    const expense = BigInt(item.expenseIdr);
    return income > max ? income : expense > max ? expense : max;
  }, 0n);
  return series.map((item) => {
    const income = BigInt(item.incomeIdr);
    const expense = BigInt(item.expenseIdr);
    const plot = (value: bigint) =>
      maximum === 0n ? 0 : Number((value * 10_000n) / maximum) / 10_000;
    return {
      period: item.month,
      label:
        item.month.length === 7
          ? monthLabel(item.month)
          : formatDateLongNoYear(item.month),
      incomeIdr: item.incomeIdr,
      expenseIdr: item.expenseIdr,
      incomePlot: plot(income),
      expensePlot: plot(expense),
    };
  });
}

export function ReportCashFlow({
  points,
  incomeIdr,
  expenseIdr,
  daily,
}: {
  points: CashFlowPoint[];
  incomeIdr: string;
  expenseIdr: string;
  daily: boolean;
}) {
  const zero = points.every(
    (point) => BigInt(point.incomeIdr) === 0n && BigInt(point.expenseIdr) === 0n,
  );
  return (
    <section aria-labelledby="report-cash-flow-title" className={cardClass}>
      <p className={`${eyebrowClass} mb-[.5rem]`}>Cash Flow</p>
      {zero ? (
        <p className="m-0 mb-[.75rem] text-muted" role="status">
          No data available for this period.
        </p>
      ) : null}
      <ChartShell
        chart={<IncomeExpenseChart points={points} />}
        summary={`Income ${formatIdr(incomeIdr)} · Expense ${formatIdr(expenseIdr)}`}
        title={daily ? "Daily comparison" : "Monthly comparison"}
      />
    </section>
  );
}
