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
      aria-labelledby="category-expense-title"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <div>
        <p className={eyebrowClass}>Kategori</p>
        <h2
          id="category-expense-title"
          className="m-0 text-[1.08rem] tracking-[-.02em]"
        >
          Pengeluaran per Kategori
        </h2>
        <p className="m-0 mt-[.35rem] text-[.84rem] text-muted">{periodLabel}</p>
      </div>
      <strong className="mt-[.35rem] text-[.88rem]">
        Total pengeluaran {formatIdr(totalExpense)}
      </strong>

      <CategoryExpenseChart
        points={visualPoints}
        totalExpense={totalExpense.toString()}
      />

      {!hasData ? (
        <p
          className="m-0 -mt-[.25rem] rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.78rem] text-muted"
          role="status"
        >
          Belum ada pengeluaran pada periode ini.
        </p>
      ) : null}

      <p className="sr-only">
        {points
          .map(
            (point) =>
              `${point.name}: ${formatIdr(point.expenseIdr)} (${(
                point.shareBps / 100
              ).toLocaleString("id-ID")}%)`,
          )
          .join(". ")}
      </p>
    </section>
  );
}