import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";
import type { TransactionFilters } from "../schemas/transaction-filters";

export function Pagination({ filters, total, totalPages }: { filters: TransactionFilters; total: number; totalPages: number }) {
  if (!total) return null;
  function href(page: number) {
    const params = new URLSearchParams();
    Object.entries({ ...filters, page }).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    return `/transactions?${params}`;
  }
  return (
    <nav className="pagination" aria-label="Paginasi transaksi">
      <Link className={`${buttonClass("secondary")} ${filters.page <= 1 ? "disabled" : ""}`} aria-disabled={filters.page <= 1} href={href(Math.max(1, filters.page - 1))}>Sebelumnya</Link>
      <span>Halaman {filters.page} dari {Math.max(totalPages, 1)} · {total} transaksi</span>
      <Link className={`${buttonClass("secondary")} ${filters.page >= totalPages ? "disabled" : ""}`} aria-disabled={filters.page >= totalPages} href={href(Math.min(totalPages, filters.page + 1))}>Berikutnya</Link>
    </nav>
  );
}
