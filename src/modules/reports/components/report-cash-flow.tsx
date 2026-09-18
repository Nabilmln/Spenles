import { formatDateLongNoYear, formatMonthYearLabel } from "@/lib/dates/format-id";
import { ReportCashFlowChart } from "./report-cash-flow-chart";
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
}: {
  points: CashFlowPoint[];
}) {
  const hasData = points.some(
    (point) =>
      BigInt(point.incomeIdr) > 0n || BigInt(point.expenseIdr) > 0n,
  );
  return (
    <section aria-label="Cash flow">
      {hasData ? (
        <ReportCashFlowChart points={points} />
      ) : (
        <div
          className="grid h-[15rem] place-items-center rounded-[.9rem] bg-surface-subtle text-center"
          role="status"
        >
          <p className="m-0 px-4 text-[.82rem] text-muted">
            No data available for this period.
          </p>
        </div>
      )}
    </section>
  );
}