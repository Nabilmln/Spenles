import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDateLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import type { SplitBillFilters } from "../schemas/split-bill-filters";
import { SplitBillDeleteButton } from "./split-bill-delete-button";

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
    const hasFilters = Boolean(
      filters.q || (filters.status && filters.status !== "all") || filters.month,
    );
    return (
      <EmptyState
        icon={<ReceiptText size={28} aria-hidden="true" />}
        title={
          hasFilters ? "Tidak ada tagihan untuk filter ini" : "Belum ada riwayat Split Bill"
        }
        description={
          hasFilters
            ? "Coba ubah kata kunci atau filter yang digunakan."
            : "Buat Split Bill pertamamu dan pembagian tagihan akan tersimpan di sini."
        }
        action={
          hasFilters ? (
            <Link className="button button-secondary" href="/split-bills">
              Reset filter
            </Link>
          ) : (
            <Link className="button button-primary" href="/split-bills/new">
              Buat Split Bill
            </Link>
          )
        }
      />
    );
  }
  return (
    <>
      <div className="domain-grid split-history-grid">
        {rows.map((row) => (
          <article className="card domain-card" key={row.id}>
            <div className="domain-card-heading">
              <div>
                <p className="eyebrow">{formatDateLong(row.billDate)}</p>
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
            <SplitBillDeleteButton billId={row.id} label={row.merchantName} />
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
