import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { IncomeExpenseChart } from "@/modules/dashboard";
import type { IncomeExpensePoint } from "@/modules/dashboard";

export function ExpenseOverviewCard({
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
    <section
      aria-label="Expense overview"
      className={`${cardClass} grid gap-[.4rem] shadow-none`}
    >
      <p className={eyebrowClass}>Expense Overview</p>
      {hasData ? (
        <>
          <p className="m-0 text-[.82rem] text-muted">
            Income and expenses over the last 6 months.
          </p>
          <IncomeExpenseChart points={points} />
        </>
      ) : (
        <p
          className="m-0 rounded-[.8rem] bg-surface-subtle p-[1rem] text-center text-[.82rem] text-muted"
          role="status"
        >
          No expense data yet. Start adding transactions to see your spending
          overview.
        </p>
      )}
      {hasData ? (
        <p className="m-0 text-[.78rem] text-muted">
          Income {formatIdr(totalIncome)} · Expense {formatIdr(totalExpense)}
        </p>
      ) : null}
    </section>
  );
}