import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonClass, cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatDateLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import type { SplitBillFilters } from "../schemas/split-bill-filters";
import { SplitBillDeleteButton } from "./split-bill-delete-button";

const statusLabel = {
  draft: "Draft",
  finalized: "Final",
  archived: "Diarsipkan",
};

const statusBadgeClass = {
  draft: "text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  finalized: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  archived: "text-muted bg-surface-subtle",
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
            <Link className={buttonClass("secondary", "w-full justify-center")} href="/split-bills">
              Reset filter
            </Link>
          ) : (
            <Link className={buttonClass("primary", "w-full justify-center")} href="/split-bills/new">
              Buat Split Bill
            </Link>
          )
        }
      />
    );
  }
  return (
    <>
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4 max-[1100px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[540px]:grid-cols-1">
        {rows.map((row) => (
          <article className={`${cardClass} grid min-w-0 gap-[.9rem]`} key={row.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowClass}>{formatDateLong(row.billDate)}</p>
                <h2>{row.merchantName}</h2>
              </div>
              <span className={`inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] whitespace-nowrap text-[.72rem] font-medium ${statusBadgeClass[row.status]}`}>
                {statusLabel[row.status]}
              </span>
            </div>
            <p>{row.participantCount} peserta</p>
            <strong>
              {row.finalAmount ? formatIdr(row.finalAmount) : "Belum final"}
            </strong>
            <Link
              className={buttonClass("secondary")}
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
      <nav className="flex items-center justify-between gap-4 text-muted max-[540px]:flex-col max-[540px]:items-stretch max-[540px]:text-center" aria-label="Paginasi tagihan patungan">
        <Link
          className={`${buttonClass("secondary")} ${filters.page <= 1 ? "pointer-events-none opacity-[.45]" : ""}`}
          aria-disabled={filters.page <= 1}
          href={pageHref(filters, Math.max(1, filters.page - 1))}
        >
          Sebelumnya
        </Link>
        <span>
          Halaman {filters.page} dari {totalPages} · {total} tagihan
        </span>
        <Link
          className={`${buttonClass("secondary")} ${filters.page >= totalPages ? "pointer-events-none opacity-[.45]" : ""}`}
          aria-disabled={filters.page >= totalPages}
          href={pageHref(filters, Math.min(totalPages, filters.page + 1))}
        >
          Berikutnya
        </Link>
      </nav>
    </>
  );
}
