import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { iconButtonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { deleteTransactionAction } from "../actions/transaction-actions";

export type TransactionCardRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  transactionAt: Date;
  note: string | null;
  accountName: string;
  categoryName: string;
};

const typeLabel: Record<TransactionCardRow["type"], string> = {
  income: "Income",
  expense: "Payment",
};

export function TransactionCard({
  transaction,
}: {
  transaction: TransactionCardRow;
}) {
  const income = transaction.type === "income";
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.8rem] rounded-[1.1rem] border border-border bg-surface p-[.85rem] shadow-card">
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

export function TransactionActions({
  transaction,
}: {
  transaction: TransactionCardRow;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        aria-label={`Edit ${transaction.categoryName}`}
        className={iconButtonClass}
        href={`/transactions/${transaction.id}/edit`}
      >
        <Pencil size={17} />
      </Link>
      <form action={deleteTransactionAction}>
        <input type="hidden" name="id" value={transaction.id} />
        <button
          aria-label={`Delete ${transaction.categoryName}`}
          className={iconButtonClass}
          type="submit"
        >
          <Trash2 size={17} />
        </button>
      </form>
    </div>
  );
}