"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { emptyStateClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatRangeLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";
import { deleteBudgetAction } from "../actions/budget-actions";
import type { BudgetListRow } from "../queries/budgets";
import { formatPercentageBps } from "../services/budget-metrics";
import { BudgetActionSheet } from "./budget-action-sheet";

const statusLabel = {
  safe: "Safe",
  warning: "Near limit",
  exceeded: "Exceeded",
};

function periodSegments(row: BudgetListRow): string[] {
  if (row.periodType === "custom") {
    return row.periodStart && row.periodEnd
      ? [`Custom`, formatRangeLong(row.periodStart, row.periodEnd)]
      : ["Custom"];
  }
  const segments = [row.periodType === "monthly" ? "Monthly" : "Weekly"];
  if (row.daysRemainingInPeriod !== null && row.daysRemainingInPeriod >= 0) {
    segments.push(
      `${row.daysRemainingInPeriod} day${row.daysRemainingInPeriod === 1 ? "" : "s"} left`,
    );
  }
  return segments;
}

export function BudgetList({
  rows,
  onEdit,
}: {
  rows: BudgetListRow[];
  onEdit: (row: BudgetListRow) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [actionRow, setActionRow] = useState<BudgetListRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<BudgetListRow | null>(null);
  const [deleting, startDeleting] = useTransition();

  function confirmDelete() {
    const id = deleteRow?.id;
    if (!id) return;
    startDeleting(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await deleteBudgetAction({}, fd);
      if (result.success) {
        toast.success(result.success);
        setDeleteRow(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Budget could not be deleted.");
      }
    });
  }

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
    <>
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
            <li key={row.id} className="min-w-0">
              <article className="card grid min-w-0 gap-[.7rem] rounded-[.9rem] border border-border bg-surface p-[.95rem] shadow-card">
                <header className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-[.75rem]">
                    <span className="grid size-[2.6rem] shrink-0 place-items-center rounded-[.8rem] bg-primary-50 text-primary-600">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="m-0 truncate text-[.95rem] font-semibold tracking-[-.02em]">
                        {row.categoryName}
                      </h2>
                      <div className="mt-[.3rem] flex min-w-0 flex-wrap gap-[.3rem]">
                        {periodSegments(row).map((segment) => (
                          <span
                            className="inline-flex min-h-[1.4rem] min-w-0 max-w-full items-center justify-center truncate rounded-full border border-border bg-surface-subtle px-[.5rem] text-[.68rem] font-medium text-muted"
                            key={segment}
                          >
                            {segment}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Budget actions"
                    aria-haspopup="dialog"
                    className="grid size-[2.4rem] shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle"
                    onClick={() => setActionRow(row)}
                  >
                    <MoreHorizontal size={18} aria-hidden="true" />
                  </button>
                </header>

                <div className="flex flex-wrap items-baseline justify-end gap-x-[.3rem] gap-y-[.15rem] text-[.76rem]">
                  <span className="min-w-0 font-medium">{formatIdr(row.usage)}</span>
                  <span className="min-w-0 text-muted">
                    {" "}/ {formatIdr(row.amount)}
                  </span>
                  <span className="ml-1 min-w-0 text-muted">
                    {formatPercentageBps(percent)} used
                  </span>
                </div>

                <div
                  className="relative h-[1.35rem] overflow-hidden rounded-full bg-surface-subtle"
                  role="progressbar"
                  aria-label={`Budget usage for ${row.categoryName}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-valuetext={`${formatPercentageBps(percent)} used`}
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0",
                      row.budgetStatus === "exceeded"
                        ? "bg-gradient-to-r from-expense to-[#f87171]"
                        : row.budgetStatus === "warning"
                          ? "bg-gradient-to-r from-warning to-[#fbbf24]"
                          : "bg-gradient-to-r from-primary-600 to-primary-500",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center text-[.7rem] font-semibold text-white mix-blend-difference"
                    aria-hidden="true"
                  >
                    {statusLabel[row.budgetStatus]}
                  </span>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <BudgetActionSheet
        open={actionRow !== null}
        onClose={() => setActionRow(null)}
        onEdit={() => {
          const row = actionRow;
          setActionRow(null);
          if (row) onEdit(row);
        }}
        onDelete={() => {
          setDeleteRow(actionRow);
          setActionRow(null);
        }}
      />

      <ConfirmDialog
        open={deleteRow !== null}
        onClose={() => {
          setDeleteRow(null);
        }}
        title="Delete budget?"
        message={`Are you sure you want to delete the budget for "${deleteRow?.categoryName ?? "this category"}"? This action cannot be undone.`}
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}