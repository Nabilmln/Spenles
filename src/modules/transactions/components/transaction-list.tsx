import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { cardClass, iconButtonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { deleteTransactionAction } from "../actions/transaction-actions";

type TransactionRow = {
  id: string;
  type: "income" | "expense";
  amount: string;
  transactionAt: Date;
  note: string | null;
  accountName: string;
  categoryName: string;
};

export function TransactionList({ rows }: { rows: TransactionRow[] }) {
  if (!rows.length) {
    return (
      <EmptyState title="No transactions yet" description="Transactions you record will appear here." />
    );
  }
  return (
    <div className="grid gap-[.75rem]">
      {rows.map((row) => (
        <article className={cn(cardClass, "grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 max-[540px]:grid-cols-[auto_minmax(0,1fr)_auto]")} key={row.id}>
          <span className={`grid size-[2.7rem] place-items-center rounded-full ${row.type === "income" ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]" : "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]"}`}>
            {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
          </span>
          <div className="grid min-w-0">
            <strong>{row.categoryName}</strong>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-muted">{row.accountName} · {formatJakartaDateLong(row.transactionAt)}</span>
            {row.note ? <small className="overflow-hidden text-ellipsis whitespace-nowrap text-muted">{row.note}</small> : null}
          </div>
          <strong className={`max-[540px]:[grid-column:2] ${row.type === "income" ? "text-income" : "text-expense"}`}>
            {row.type === "income" ? "+" : "−"} {formatIdr(row.amount)}
          </strong>
          <div className="flex items-center gap-2 max-[540px]:[grid-column:3] max-[540px]:[grid-row:1/span_2]">
            <Link className={iconButtonClass} aria-label={`Edit ${row.categoryName}`} href={`/transactions/${row.id}/edit`}><Pencil size={17} /></Link>
            <form action={deleteTransactionAction}>
              <input type="hidden" name="id" value={row.id} />
              <button className={iconButtonClass} aria-label={`Delete ${row.categoryName}`} type="submit"><Trash2 size={17} /></button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
