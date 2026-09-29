import { ArrowRightLeft, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";

export type TransactionCardRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: string;
  transactionAt: Date;
  note: string | null;
  categoryName: string;
  categoryId?: string | null;
  categoryIcon?: string | null;
  sourceAccountName?: string | null;
  destinationAccountName?: string | null;
};

const typeLabel: Record<TransactionCardRow["type"], string> = {
  income: "Income",
  expense: "Payment",
  transfer: "Transfer",
};

function resolveIcon(row: TransactionCardRow): LucideIcon {
  if (row.type === "transfer") return ArrowRightLeft;
  if (row.categoryId) return resolveCategoryIcon(row.categoryId, row.categoryName, row.categoryIcon ?? null);
  return ArrowRightLeft;
}

function renderCardIcon(row: TransactionCardRow): ReactNode {
  return createElement(resolveIcon(row), { size: 20, "aria-hidden": true });
}

export function TransactionCard({
  transaction,
  compact = false,
  showActions = false,
  onAction,
}: {
  transaction: TransactionCardRow;
  compact?: boolean;
  showActions?: boolean;
  onAction?: (id: string, type: TransactionCardRow["type"]) => void;
}) {
  const isTransfer = transaction.type === "transfer";
  const prefix = isTransfer ? "" : transaction.type === "income" ? "+" : "\u2212";

  return (
    <article className="min-w-0 rounded-[1.25rem] bg-[#e8e9ec] p-[2px]">
      <div
        className={cn(
          "grid min-w-0 items-center gap-[.7rem] rounded-[1.12rem] bg-surface",
          showActions
            ? "grid-cols-[auto_minmax(0,1fr)_auto_auto]"
            : "grid-cols-[auto_minmax(0,1fr)_auto]",
          compact ? "p-[.7rem_.8rem]" : "p-[.85rem]",
        )}
      >
        <span
          className="grid size-[2.7rem] shrink-0 place-items-center rounded-full bg-primary-50 text-foreground"
        >
          {renderCardIcon(transaction)}
        </span>

        <div className="grid min-w-0">
          <strong className="line-clamp-2 min-w-0 text-[.9rem] font-semibold leading-tight">{transaction.categoryName}</strong>
          <span className="truncate text-[.74rem] font-medium text-muted">
            {isTransfer && transaction.sourceAccountName && transaction.destinationAccountName
              ? `${transaction.sourceAccountName} \u2192 ${transaction.destinationAccountName}`
              : typeLabel[transaction.type]}
          </span>
        </div>

        <div className="grid min-w-0 justify-items-end gap-[.15rem] text-right">
          <strong
            className="max-w-[7rem] text-[.84rem] font-semibold tabular-nums text-amount [overflow-wrap:anywhere]"
          >
            {prefix}{prefix ? " " : ""}{formatIdr(transaction.amount)}
          </strong>
          <span className="max-w-[7rem] text-[.68rem] leading-tight text-muted">
            {formatJakartaDateLong(transaction.transactionAt)}
          </span>
        </div>

        {showActions ? (
          <button
            type="button"
            className="grid size-[2.4rem] shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary-600"
            onClick={() => onAction?.(transaction.id, transaction.type)}
            aria-label="Transaction actions"
          >
            <MoreHorizontal size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p className="m-0 min-h-[1.875rem] px-[.75rem] py-[.45rem] text-[.675rem]! font-semibold leading-snug text-[#5c5d66]! [overflow-wrap:anywhere]">
        {transaction.note?.trim() || "No Description"}
      </p>
    </article>
  );
}
