import { cn } from "@/lib/utils";
import { cardClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";

export type ReportTotals = {
  incomeIdr: string;
  expenseIdr: string;
  netIdr: string;
};

const cardCellClass = cn(
  cardClass,
  "grid min-w-0 justify-items-center gap-[.2rem] text-center shadow-none",
);
const labelClass = "m-0 text-[.68rem] font-medium text-foreground";
const valueClass =
  "wrap-anywhere text-[.65rem] tracking-[-.01em] [overflow-wrap:anywhere]";

export function CompactReportSummary({
  totals,
}: {
  totals: ReportTotals;
}) {
  const net = BigInt(totals.netIdr);
  const netClass = net > 0n ? "text-income" : net < 0n ? "text-expense" : "";
  return (
    <section aria-label="Period overview" className="grid grid-cols-3 gap-[.4rem]">
      <article className={cardCellClass}>
        <p className={labelClass}>Income</p>
        <strong className={cn(valueClass, "text-income")}>
          +{formatIdr(totals.incomeIdr)}
        </strong>
      </article>
      <article className={cardCellClass}>
        <p className={labelClass}>Expense</p>
        <strong className={cn(valueClass, "text-expense")}>
          −{formatIdr(totals.expenseIdr)}
        </strong>
      </article>
      <article className={cardCellClass}>
        <p className={labelClass}>Net</p>
        <strong className={cn(valueClass, netClass)}>{formatIdr(net)}</strong>
      </article>
    </section>
  );
}