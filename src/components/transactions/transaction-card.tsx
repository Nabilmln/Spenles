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

function iconAccentClass(row: TransactionCardRow): string {
  if (row.type === "transfer") return "text-primary-600 bg-[color-mix(in_srgb,var(--primary-600)_10%,transparent)]";
  if (row.type === "income") return "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]";
  return "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]";
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
  const income = transaction.type === "income";
  const amountColor = isTransfer ? "text-foreground" : income ? "text-income" : "text-expense";
  const prefix = isTransfer ? "" : income ? "+" : "\u2212";

  return (
    <article
      className={cn(
        "grid items-center gap-[.8rem] rounded-[1.1rem] border border-border bg-surface shadow-card",
        showActions
          ? "grid-cols-[auto_minmax(0,1fr)_auto_auto]"
          : "grid-cols-[auto_minmax(0,1fr)_auto]",
        compact ? "p-[.7rem_.85rem]" : "p-[.85rem]",
      )}
    >
      <span
        className={cn(
          "grid size-[2.7rem] shrink-0 place-items-center rounded-full",
          iconAccentClass(transaction),
        )}
      >
        {renderCardIcon(transaction)}
      </span>

      <div className="grid min-w-0">
        <strong className="truncate text-[.9rem]">{transaction.categoryName}</strong>
        <span className="truncate text-[.74rem] font-medium text-muted">
          {isTransfer && transaction.sourceAccountName && transaction.destinationAccountName
            ? `${transaction.sourceAccountName} \u2192 ${transaction.destinationAccountName}`
            : typeLabel[transaction.type]}
        </span>
        {transaction.note ? (
          <span className="truncate text-[.72rem] text-muted">{transaction.note}</span>
        ) : null}
      </div>

      <div className="grid justify-items-end gap-[.15rem]">
        <strong
          className={cn(
            "whitespace-nowrap text-[.85rem] [overflow-wrap:anywhere]",
            amountColor,
          )}
        >
          {prefix}{prefix ? " " : ""}{formatIdr(transaction.amount)}
        </strong>
        <span className="text-[.7rem] text-muted">
          {formatJakartaDateLong(transaction.transactionAt)}
        </span>
      </div>

      {showActions ? (
        <button
          type="button"
          className="grid size-[2.4rem] shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle"
          onClick={() => onAction?.(transaction.id, transaction.type)}
          aria-label="Transaction actions"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      ) : null}
    </article>
  );
}
