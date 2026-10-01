import { formatLongDateUtc, formatMonthYearLabel } from "@/lib/dates/format-id";
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

export type CashFlowRange = { from: string; to: string; daily: boolean };

function periodKeys({ from, to, daily }: CashFlowRange): string[] {
  const keys: string[] = [];
  if (daily) {
    const end = new Date(`${to}T00:00:00Z`).getTime();
    for (let time = new Date(`${from}T00:00:00Z`).getTime(); time <= end; time += 86_400_000) {
      keys.push(new Date(time).toISOString().slice(0, 10));
    }
  } else {
    const end = Number(to.slice(0, 4)) * 12 + Number(to.slice(5, 7)) - 1;
    for (let month = Number(from.slice(0, 4)) * 12 + Number(from.slice(5, 7)) - 1; month <= end; month++) {
      keys.push(`${Math.floor(month / 12)}-${String((month % 12) + 1).padStart(2, "0")}`);
    }
  }
  return keys;
}

export function buildCashFlowPoints(series: ReportMonth[], range: CashFlowRange): CashFlowPoint[] {
  const byPeriod = new Map(series.map((item) => [item.month, item]));
  const maximum = series.reduce((max, item) => {
    const income = BigInt(item.incomeIdr);
    const expense = BigInt(item.expenseIdr);
    return income > max ? income : expense > max ? expense : max;
  }, 0n);
  return periodKeys(range).map((period) => {
    const item = byPeriod.get(period) ?? { month: period, incomeIdr: "0", expenseIdr: "0" };
    const income = BigInt(item.incomeIdr);
    const expense = BigInt(item.expenseIdr);
    const plot = (value: bigint) =>
      maximum === 0n ? 0 : Number((value * 10_000n) / maximum) / 10_000;
    return {
      period,
      label: range.daily ? formatLongDateUtc(period) : monthLabel(period),
      incomeIdr: item.incomeIdr,
      expenseIdr: item.expenseIdr,
      incomePlot: plot(income),
      expensePlot: plot(expense),
    };
  });
}

export function ReportCashFlow({
  points,
  from,
  to,
}: {
  points: CashFlowPoint[];
  from: string;
  to: string;
}) {
  return (
    <section aria-label="Cash flow">
      <ReportCashFlowChart points={points} from={from} to={to} />
    </section>
  );
}
