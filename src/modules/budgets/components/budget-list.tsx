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
            <li key={row.id}>
              <article className="card grid min-w-0 gap-[.7rem] rounded-[.9rem] border border-border bg-surface p-[.95rem] shadow-card">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-[.8rem]">
                    <span className="grid size-[2.6rem] shrink-0 place-items-center rounded-[.8rem] bg-primary-50 text-primary-600">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="m-0 truncate text-[.95rem] font-semibold tracking-[-.02em]">
                        {row.categoryName}
                      </h2>
                      <span className="mt-[.3rem] inline-flex min-h-[1.4rem] max-w-full items-center gap-[.3rem] rounded-full border border-border bg-surface-subtle px-[.5rem] text-[.68rem] font-medium text-muted">
                        {periodLabel(row)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-start gap-[.4rem]">
                    <span
                      className={cn(
                        "mt-[.15rem] inline-flex min-h-[1.7rem] items-center rounded-full px-[.55rem] py-[.25rem] text-[.7rem] font-medium whitespace-nowrap",
                        statusBadgeClass[row.budgetStatus],
                      )}
                    >
                      {statusLabel[row.budgetStatus]}
                    </span>
                    <button
                      type="button"
                      aria-label="Budget actions"
                      aria-haspopup="dialog"
                      className="grid size-[2.4rem] shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle"
                      onClick={() => setActionRow(row)}
                    >
                      <MoreHorizontal size={18} aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div className="flex items-baseline justify-end gap-[.3rem] text-[.76rem]">
                  <span className="font-medium">{formatIdr(row.usage)}</span>
                  <span className="text-muted"> / {formatIdr(row.amount)}</span>
                  <span className="ml-1 text-muted">
                    {formatPercentageBps(percent)} used
                  </span>
                </div>

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
                        ? "bg-gradient-to-r from-expense to-[#f87171]"
                        : row.budgetStatus === "warning"
                          ? "bg-gradient-to-r from-warning to-[#fbbf24]"
                          : "bg-gradient-to-r from-primary-600 to-primary-500",
                    )}
                    style={{ width: `${progress}%` }}
                  />
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