"use client";

import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  emptyStateClass,
  eyebrowClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatRangeLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";
import {
  archiveBudgetAction,
  restoreBudgetAction,
  type BudgetActionState,
} from "../actions/budget-actions";
import type { BudgetListRow } from "../queries/budgets";
import { formatPercentageBps } from "../services/budget-metrics";

const statusLabel = {
  safe: "Safe",
  warning: "Near limit",
  exceeded: "Exceeded",
};

const statusBadgeClass = {
  safe: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  warning: "text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  exceeded: "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]",
};

function periodLabel(row: BudgetListRow) {
  if (row.periodType === "custom") {
    return row.periodStart && row.periodEnd
      ? `Custom · ${formatRangeLong(row.periodStart, row.periodEnd)}`
      : "Custom";
  }
  const suffix =
    row.daysRemainingInPeriod !== null && row.daysRemainingInPeriod >= 0
      ? ` · ${row.daysRemainingInPeriod} day${row.daysRemainingInPeriod === 1 ? "" : "s"} left`
      : "";
  return row.periodType === "monthly"
    ? `Monthly${suffix}`
    : `Weekly${suffix}`;
}

function BudgetStatusForm({ row }: { row: BudgetListRow }) {
  const action =
    row.recordStatus === "active" ? archiveBudgetAction : restoreBudgetAction;
  const [, formAction, pending] = useToastActionState<
    BudgetActionState,
    FormData
  >(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={row.id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending
          ? "Processing..."
          : row.recordStatus === "active"
            ? "Archive"
            : "Restore"}
      </Button>
    </form>
  );
}

export function BudgetList({
  rows,
  onEdit,
}: {
  rows: BudgetListRow[];
  onEdit: (row: BudgetListRow) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className={emptyStateClass}>
        <p className="m-0 text-muted">
          No budgets yet. Create a budget for an expense category to track your
          spending.
        </p>
      </div>
    );
  }
  return (
    <ol className="m-0 grid list-none gap-[.9rem] p-0">
      {rows.map((row) => {
        const percent = BigInt(row.percentageBps);
        const progress = Number(percent > 10_000n ? 10_000n : percent) / 100;
        const Icon = resolveCategoryIcon(
          row.categoryId,
          row.categoryName,
          row.categoryIcon,
        );
        return (
          <li key={row.id}>
            <article className="card grid min-w-0 gap-[.9rem] rounded-[.9rem] border border-border bg-surface p-[.95rem] shadow-card">
              <header className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-[.8rem]">
                  <span className="grid size-[2.6rem] shrink-0 place-items-center rounded-[.8rem] bg-primary-50 text-primary-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="m-0 truncate text-[.95rem] font-semibold tracking-[-.02em]">
                      {row.categoryName}
                    </h2>
                    <p className={cn(eyebrowClass, "mb-0")}>{periodLabel(row)}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] text-[.72rem] font-medium whitespace-nowrap",
                    statusBadgeClass[row.budgetStatus],
                  )}
                >
                  {statusLabel[row.budgetStatus]}
                </span>
              </header>

              <div
                className="h-[.65rem] overflow-hidden rounded-full bg-surface-subtle"
                role="progressbar"
                aria-label={`Budget usage for ${row.categoryName}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-valuetext={`${formatPercentageBps(percent)} used`}
              >
                <span
                  className={cn(
                    "block h-full rounded-[inherit]",
                    row.budgetStatus === "exceeded"
                      ? "bg-expense"
                      : row.budgetStatus === "warning"
                        ? "bg-[#b45309]"
                        : "bg-primary-600",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="m-0 text-[.88rem]">
                <span className="font-medium">{formatIdr(row.usage)}</span>
                <span className="text-muted"> / {formatIdr(row.amount)}</span>
                <span className="ml-1 text-muted">
                  ({formatPercentageBps(percent)} used)
                </span>
              </p>

              <footer className="flex items-center gap-2">
                {row.recordStatus === "active" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </Button>
                ) : null}
                <BudgetStatusForm row={row} />
              </footer>
            </article>
          </li>
        );
      })}
    </ol>
  );
}