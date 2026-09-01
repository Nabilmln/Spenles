import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";

export type ReportTotals = {
  incomeIdr: string;
  expenseIdr: string;
  netIdr: string;
};

const cellClass =
  "grid min-w-0 justify-items-center gap-[.2rem] border-l border-border p-[1.1rem_.9rem] text-center first:border-l-0 max-[720px]:p-[.9rem_.65rem]";
const labelClass =
  "text-[.72rem] font-medium uppercase tracking-[.04em] whitespace-nowrap text-muted";
const valueClass = "truncate text-base max-[720px]:text-[.88rem]";

export function CompactReportSummary({
  totals,
}: {
  totals: ReportTotals;
}) {
  const net = BigInt(totals.netIdr);
  const netClass =
    net > 0n ? "text-income" : net < 0n ? "text-expense" : "";
  return (
    <section aria-label="Period overview" className="grid grid-cols-3 rounded-2xl border border-border bg-surface shadow-card">
      <div className={cellClass}>
        <span className={labelClass}>Income</span>
        <strong className={cn(valueClass, "text-income")}>+{formatIdr(totals.incomeIdr)}</strong>
      </div>
      <div className={cellClass}>
        <span className={labelClass}>Expense</span>
        <strong className={cn(valueClass, "text-expense")}>−{formatIdr(totals.expenseIdr)}</strong>
      </div>
      <div className={cellClass}>
        <span className={labelClass}>Net</span>
        <strong className={cn(valueClass, netClass)}>{formatIdr(net)}</strong>
      </div>
    </section>
  );
}
