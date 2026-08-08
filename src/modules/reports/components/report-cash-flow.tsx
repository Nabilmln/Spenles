import { formatIdr } from "@/lib/money/format-idr";
import { formatDateLongNoYear } from "@/lib/dates/format-id";
import { ChartShell, IncomeExpenseChart } from "@/modules/dashboard";
import { formatReportRange } from "../lib/report-date";
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
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
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
  from,
  to,
  points,
  incomeIdr,
  expenseIdr,
  daily,
}: {
  from: string;
  to: string;
  points: CashFlowPoint[];
  incomeIdr: string;
  expenseIdr: string;
  daily: boolean;
}) {
  const zero = points.every(
    (point) => BigInt(point.incomeIdr) === 0n && BigInt(point.expenseIdr) === 0n,
  );
  return (
    <section aria-labelledby="report-cash-flow-title" className="card report-cash-flow-card">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Arus Kas</p>
          <h2 id="report-cash-flow-title">Pemasukan vs pengeluaran</h2>
        </div>
        <p>{formatReportRange(from, to)}</p>
      </div>
      {zero ? (
        <p className="muted report-zero-hint" role="status">
          Belum ada data pada periode ini.
        </p>
      ) : null}
      <ChartShell
        chart={<IncomeExpenseChart points={points} />}
        description={
          daily
            ? "Pemasukan dan pengeluaran per hari kalender Jakarta."
            : "Pemasukan dan pengeluaran per bulan kalender Jakarta."
        }
        summary={`Pemasukan ${formatIdr(incomeIdr)} · Pengeluaran ${formatIdr(expenseIdr)}`}
        table={null}
        title={daily ? "Perbandingan harian" : "Perbandingan bulanan"}
      />
    </section>
  );
}