import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import type { CategoryExpensePoint } from "../types/dashboard";
import { buildCategoryVisualPoints } from "../services/chart-contracts";
import { CategoryExpenseChart } from "./category-expense-chart";

export function CategoryExpenseCard({
  periodLabel,
  points,
  totalExpense,
}: {
  periodLabel: string;
  points: CategoryExpensePoint[];
  totalExpense: bigint;
}) {
  const visualPoints = buildCategoryVisualPoints(points);
  const hasData = totalExpense > 0n;

  return (
    <section
      aria-label="Expense by Category"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <div>
        <p className={eyebrowClass}>Category</p>
        <p className="m-0 mt-[.35rem] text-[.84rem] text-muted">{periodLabel}</p>
      </div>
      <strong className="mt-[.35rem] text-[.88rem]">
        Total expense {formatIdr(totalExpense)}
      </strong>

      <CategoryExpenseChart points={visualPoints} />

      {!hasData ? (
        <p
          className="m-0 -mt-[.25rem] rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.78rem] text-muted"
          role="status"
        >
          No expenses yet for this period.
        </p>
      ) : null}

      <p className="sr-only">
        {points
          .map(
            (point) =>
              `${point.name}: ${formatIdr(point.expenseIdr)} (${(
                point.shareBps / 100
              ).toLocaleString("en-US")}%)`,
          )
          .join(". ")}
      </p>
    </section>
  );
}