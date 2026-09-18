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
      <TransactionTrendChart points={points} />
      {!hasData ? (
        <p
          role="status"
          className="m-0 px-[.1rem] pt-[.6rem] text-center text-[.76rem] text-muted"
        >
          No transaction data yet.
        </p>
      ) : null}
    </section>
  );
}