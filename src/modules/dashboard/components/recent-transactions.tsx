import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, List } from "lucide-react";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { cardClass, eyebrowClass, textLinkClass } from "@/components/ui/styles";
import type { RecentDashboardTransaction } from "../types/dashboard";

export function RecentTransactions({
  rows,
}: {
  rows: RecentDashboardTransaction[];
}) {
  return (
    <section aria-labelledby="recent-transactions-title" className={`${cardClass} shadow-none`}>
      <div className="mb-4 flex items-start justify-between gap-4 max-[540px]:flex-col">
        <div>
          <p className={eyebrowClass}>Aktivitas terbaru</p>
          <h2 id="recent-transactions-title" className="m-0 text-[1.08rem] tracking-[-.02em]">Transaksi pada periode ini</h2>
        </div>
        <Link className={`${textLinkClass} inline-flex items-center gap-[.4rem] text-[.82rem]`} href="/transactions">
          <List size={17} />
          Lihat semua
        </Link>
      </div>

      {rows.length ? (
        <div className="grid">
          {rows.map((row) => (
            <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.85rem] border-b border-border p-[.85rem_0] last:border-0 max-[540px]:grid-cols-[auto_minmax(0,1fr)]" key={row.id}>
              <span className={`grid size-[2.7rem] shrink-0 place-items-center rounded-full ${row.type === "income" ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]" : "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]"}`}>
                {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
              </span>
              <div className="grid min-w-0">
                <strong>{row.categoryName}</strong>
                <span className="truncate text-[.76rem] text-muted">
                  {row.accountName} · {formatJakartaDateLong(row.transactionAt)}
                </span>
                {row.note ? <small className="truncate text-[.76rem] text-muted">{row.note}</small> : null}
              </div>
              <strong className={`max-[540px]:col-start-2 ${row.type === "income" ? "text-income" : "text-expense"}`}>
                {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
              </strong>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid min-h-[10rem] place-items-center rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-4 text-center text-[.84rem] text-muted" role="status">
          Belum ada transaksi pada periode terpilih.
        </div>
      )}
    </section>
  );
}
