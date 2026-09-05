import type { IncomeExpensePoint } from "@/modules/dashboard";
import { TransactionTrendChart } from "./transaction-trend-chart";

export function ExpenseOverviewCard({
  points,
}: {
  points: IncomeExpensePoint[];
}) {
  const hasData = points.some((point) => BigInt(point.expenseIdr) > 0n);

  return (
    <section aria-label="Expense overview">
      {hasData ? (
        <TransactionTrendChart points={points} />
      ) : (
        <div
          className="grid h-[12.5rem] place-items-center rounded-[.9rem] bg-surface-subtle text-center"
          role="status"
        >
          <p className="m-0 px-4 text-[.82rem] text-muted">
            No transaction data yet.
          </p>
        </div>
      )}
    </section>
  );
}