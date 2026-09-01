import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionFilters } from "../schemas/transaction-filters";

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

export function Pagination({
  filters,
  total,
  totalPages,
}: {
  filters: TransactionFilters;
  total: number;
  totalPages: number;
}) {
  if (!total) return null;

  function href(page: number) {
    const params = new URLSearchParams();
    Object.entries({ ...filters, page }).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    return `/transactions?${params}`;
  }

  return (
    <nav aria-label="Transaction pagination" className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        <Link
          className={cn(
            pageLinkClass,
            filters.page <= 1 && "pointer-events-none opacity-[.45]",
          )}
          aria-disabled={filters.page <= 1}
          aria-label="Previous page"
          href={href(Math.max(1, filters.page - 1))}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
        {pageItems(filters.page, totalPages).map((item) =>
          typeof item === "number" ? (
            <Link
              aria-current={item === filters.page ? "page" : undefined}
              className={cn(pageLinkClass, item === filters.page && pageLinkActive)}
              href={href(item)}
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
          aria-label="Next page"
          href={href(Math.min(totalPages, filters.page + 1))}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <p className="m-0 text-[.76rem] text-muted">
        Page {filters.page} of {Math.max(totalPages, 1)} · {total} transactions
      </p>
    </nav>
  );
}