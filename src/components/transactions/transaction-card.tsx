import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";

export type TransactionCardRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  transactionAt: Date;
  note: string | null;
  categoryName: string;
};

const typeLabel: Record<TransactionCardRow["type"], string> = {
  income: "Income",
  expense: "Payment",
};

export function TransactionCard({
  transaction,
  compact = false,
}: {
  transaction: TransactionCardRow;
  compact?: boolean;
}) {
  const income = transaction.type === "income";
  return (
    <article
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.8rem] rounded-[1.1rem] border border-border bg-surface shadow-card",
        compact ? "p-[.7rem_.85rem]" : "p-[.85rem]",
      )}
    >
      <span
        className={cn(
          "grid size-[2.7rem] shrink-0 place-items-center rounded-full",
          income
            ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]"
            : "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]",
        )}
      >
        {income ? (
          <ArrowDownLeft size={20} aria-hidden="true" />
        ) : (
          <ArrowUpRight size={20} aria-hidden="true" />
        )}
      </span>

      <div className="grid min-w-0">
        <strong className="truncate text-[.9rem]">{transaction.categoryName}</strong>
        <span className="truncate text-[.74rem] font-medium text-muted">
          {typeLabel[transaction.type]}
        </span>
        {transaction.note ? (
          <span className="truncate text-[.72rem] text-muted">{transaction.note}</span>
        ) : null}
      </div>

      <div className="grid justify-items-end gap-[.15rem]">
        <strong
          className={cn(
            "whitespace-nowrap text-[.85rem] [overflow-wrap:anywhere]",
            income ? "text-income" : "text-expense",
          )}
        >
          {income ? "+" : "−"} {formatIdr(transaction.amount)}
        </strong>
        <span className="text-[.7rem] text-muted">
          {formatJakartaDateLong(transaction.transactionAt)}
        </span>
      </div>
    </article>
  );
}