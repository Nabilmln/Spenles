import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, List } from "lucide-react";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import type { RecentDashboardTransaction } from "../types/dashboard";

export function RecentTransactions({
  rows,
}: {
  rows: RecentDashboardTransaction[];
}) {
  return (
    <section aria-labelledby="recent-transactions-title" className="recent-card card">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Aktivitas terbaru</p>
          <h2 id="recent-transactions-title">Transaksi pada periode ini</h2>
        </div>
        <Link className="text-link dashboard-link" href="/transactions">
          <List size={17} />
          Lihat semua
        </Link>
      </div>

      {rows.length ? (
        <div className="recent-list">
          {rows.map((row) => (
            <article className="recent-row" key={row.id}>
              <span className={`transaction-icon ${row.type}`}>
                {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
              </span>
              <div className="recent-copy">
                <strong>{row.categoryName}</strong>
                <span>
                  {row.accountName} · {formatJakartaDateLong(row.transactionAt)}
                </span>
                {row.note ? <small>{row.note}</small> : null}
              </div>
              <strong className={`transaction-amount ${row.type}`}>
                {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
              </strong>
            </article>
          ))}
        </div>
      ) : (
        <div className="dashboard-inline-empty" role="status">
          Belum ada transaksi pada periode terpilih.
        </div>
      )}
    </section>
  );
}
