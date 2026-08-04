import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { formatJakartaDateTime } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { deleteTransactionAction } from "../actions/transaction-actions";

export type TransactionRow = {
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
    return <div className="empty-state"><div><h2>Tidak ada transaksi</h2><p>Tambahkan transaksi atau ubah filter yang digunakan.</p></div></div>;
  }
  return (
    <div className="transaction-list">
      {rows.map((row) => (
        <article className="transaction-row card" key={row.id}>
          <span className={`transaction-icon ${row.type}`}>
            {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
          </span>
          <div className="transaction-copy">
            <strong>{row.categoryName}</strong>
            <span>{row.accountName} · {formatJakartaDateTime(row.transactionAt)}</span>
            {row.note ? <small>{row.note}</small> : null}
          </div>
          <strong className={`transaction-amount ${row.type}`}>
            {row.type === "income" ? "+" : "−"} {formatIdr(row.amount)}
          </strong>
          <div className="transaction-actions">
            <Link className="icon-button" aria-label={`Edit ${row.categoryName}`} href={`/transactions/${row.id}/edit`}><Pencil size={17} /></Link>
            <form action={deleteTransactionAction}>
              <input type="hidden" name="id" value={row.id} />
              <button className="icon-button" aria-label={`Hapus ${row.categoryName}`} type="submit"><Trash2 size={17} /></button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
