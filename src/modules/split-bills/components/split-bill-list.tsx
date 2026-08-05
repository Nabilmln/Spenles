import Link from "next/link";
import { formatIdr } from "@/lib/money/format-idr";
import type { SplitBillFilters } from "../schemas/split-bill-filters";

const statusLabel = {
  draft: "Draft",
  finalized: "Final",
  archived: "Diarsipkan",
};

type Row = {
  id: string;
  merchantName: string;
  billDate: string;
  status: keyof typeof statusLabel;
  finalAmount: string | null;
  participantCount: number;
};

function pageHref(filters: SplitBillFilters, page: number) {
  const params = new URLSearchParams();
  Object.entries({ ...filters, page }).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return `/split-bills?${params}`;
}

export function SplitBillList({
  rows,
  total,
  totalPages,
  filters,
}: {
  rows: Row[];
  total: number;
  totalPages: number;
  filters: SplitBillFilters;
}) {
  if (!rows.length) {
    return (
      <div className="empty-state">
        <p>Belum ada tagihan patungan untuk filter ini.</p>
      </div>
    );
  }
  return (
    <>
      <div className="domain-grid split-history-grid">
        {rows.map((row) => (
          <article className="card domain-card" key={row.id}>
            <div className="domain-card-heading">
              <div>
                <p className="eyebrow">{row.billDate}</p>
                <h2>{row.merchantName}</h2>
              </div>
              <span className={`status-badge split-status-${row.status}`}>
                {statusLabel[row.status]}
              </span>
            </div>
            <p>{row.participantCount} peserta</p>
            <strong>
              {row.finalAmount ? formatIdr(row.finalAmount) : "Belum final"}
            </strong>
            <Link
              className="button button-secondary"
              href={
                row.status === "draft"
                  ? `/split-bills/${row.id}/edit`
                  : `/split-bills/${row.id}`
              }
            >
              {row.status === "draft" ? "Lanjutkan draft" : "Lihat hasil"}
            </Link>
          </article>
        ))}
      </div>
      <nav className="pagination" aria-label="Paginasi tagihan patungan">
        <Link
          className={`button button-secondary ${filters.page <= 1 ? "disabled" : ""}`}
          aria-disabled={filters.page <= 1}
          href={pageHref(filters, Math.max(1, filters.page - 1))}
        >
          Sebelumnya
        </Link>
        <span>
          Halaman {filters.page} dari {totalPages} · {total} tagihan
        </span>
        <Link
          className={`button button-secondary ${filters.page >= totalPages ? "disabled" : ""}`}
          aria-disabled={filters.page >= totalPages}
          href={pageHref(filters, Math.min(totalPages, filters.page + 1))}
        >
          Berikutnya
        </Link>
      </nav>
    </>
  );
}
