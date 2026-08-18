import Link from "next/link";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { formatDayDateLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";
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

function pageItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis-start");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis-end");
  items.push(total);
  return items;
}

const pageLinkClass =
  "grid h-[2.6rem] min-w-[2.6rem] place-items-center rounded-[.65rem] border border-border bg-surface text-foreground transition-colors hover:bg-surface-subtle";

const pageLinkActive =
  "border-primary-600 bg-primary-600 text-white hover:bg-primary-700";

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
          <article className={`${cardClass} grid min-w-0 gap-[.75rem]`} key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 text-[.78rem] font-medium text-muted">
                  {formatDayDateLong(row.billDate)}
                </p>
                <h2 className="truncate">{row.merchantName}</h2>
              </div>
              <span className={`inline-flex min-h-[1.6rem] shrink-0 items-center rounded-full px-[.5rem] py-[.15rem] whitespace-nowrap text-[.7rem] font-medium ${statusBadgeClass[row.status]}`}>
                {statusLabel[row.status]}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[.8rem] text-muted">
                {row.participantCount} peserta
              </span>
              <strong className="min-w-0 text-[.95rem] [overflow-wrap:anywhere]">
                {row.finalAmount ? formatIdr(row.finalAmount) : "Belum final"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-[.75rem]">
              <Link
                className={buttonClass("primary", "flex-1 justify-center")}
                href={
                  row.status === "draft"
                    ? `/split-bills/${row.id}/edit`
                    : `/split-bills/${row.id}`
                }
              >
                {row.status === "draft" ? "Lanjutkan draft" : "Lihat hasil"}
              </Link>
              <SplitBillDeleteButton billId={row.id} label={row.merchantName} />
            </div>
          </article>
        ))}
      </div>
      <nav aria-label="Paginasi tagihan patungan" className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <Link
            className={cn(
              pageLinkClass,
              filters.page <= 1 && "pointer-events-none opacity-[.45]",
            )}
            aria-disabled={filters.page <= 1}
            aria-label="Halaman sebelumnya"
            href={pageHref(filters, Math.max(1, filters.page - 1))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </Link>
          {pageItems(filters.page, totalPages).map((item) =>
            typeof item === "number" ? (
              <Link
                aria-current={item === filters.page ? "page" : undefined}
                className={cn(pageLinkClass, item === filters.page && pageLinkActive)}
                href={pageHref(filters, item)}
                key={item}
              >
                {item}
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="px-[.25rem] text-muted"
                key={item}
              >
                …
              </span>
            ),
          )}
          <Link
            className={cn(
              pageLinkClass,
              filters.page >= totalPages && "pointer-events-none opacity-[.45]",
            )}
            aria-disabled={filters.page >= totalPages}
            aria-label="Halaman berikutnya"
            href={pageHref(filters, Math.min(totalPages, filters.page + 1))}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <p className="m-0 text-[.76rem] text-muted">
          Halaman {filters.page} dari {totalPages} · {total} tagihan
        </p>
      </nav>
    </>
  );
}
