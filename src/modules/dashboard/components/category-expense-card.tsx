import { formatIdr } from "@/lib/money/format-idr";
import type { CategoryExpensePoint } from "../types/dashboard";
import { buildCategoryVisualPoints } from "../services/chart-contracts";
import { AccessibleChartTable } from "./accessible-chart-table";
import { CategoryExpenseChart } from "./category-expense-chart";
import { ChartShell } from "./chart-shell";

function shareLabel(shareBps: number) {
  return `${(shareBps / 100).toLocaleString("id-ID")}%`;
}

export function CategoryExpenseCard({
  periodLabel,
  totalExpense,
  points,
}: {
  points: CategoryExpensePoint[];
  totalExpense: bigint;
  periodLabel: string;
}) {
  const visualPoints = buildCategoryVisualPoints(points);
  return (
    <ChartShell
      chart={<CategoryExpenseChart points={visualPoints} />}
      description={`Pangsa pengeluaran setiap kategori pada ${periodLabel}.`}
      summary={`Total pengeluaran ${formatIdr(totalExpense)}`}
      table={
        <AccessibleChartTable
          caption="Pengeluaran per kategori"
          columns={[
            { key: "category", label: "Kategori" },
            { key: "amount", label: "Pengeluaran", align: "right" },
            { key: "share", label: "Porsi", align: "right" },
          ]}
          rows={points.map((point) => ({
            id: point.categoryId,
            category: point.name,
            amount: formatIdr(point.expenseIdr),
            share: shareLabel(point.shareBps),
          }))}
        />
      }
      title="Pengeluaran per Kategori"
    />
  );
}