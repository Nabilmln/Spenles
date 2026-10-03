import type { IncomeExpensePoint } from "@/modules/dashboard";
import { formatIdr } from "@/lib/money/format-idr";
import { TransactionTrendChart } from "./transaction-trend-chart";

export function ExpenseOverviewCard({
  points,
  totalExpense,
}: {
  points: IncomeExpensePoint[];
  totalExpense: bigint;
}) {
  const hasData = totalExpense > 0n;

  return (
    <section aria-label="Expense overview" className="min-w-0">
      <p className="m-0 text-[.82rem] font-medium text-muted">Total Expenses</p>
      <strong className="mt-[.15rem] block text-[clamp(1.5rem,7vw,2rem)] font-semibold leading-[1.15] tracking-[-.03em] tabular-nums text-foreground [overflow-wrap:anywhere]">
        {formatIdr(totalExpense)}
      </strong>
      <TransactionTrendChart points={points} hasData={hasData} />
      {!hasData ? (
        <p
          role="status"
          className="m-0 px-[.1rem] pt-[.6rem] text-center text-[.76rem] text-muted"
        >
          No expenses this month.
        </p>
      ) : null}
    </section>
  );
}
