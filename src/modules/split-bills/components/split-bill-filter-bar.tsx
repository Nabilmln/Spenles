"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { MonthSelector } from "@/components/ui/month-selector";
import { buttonClass, fieldClass, iconButtonClass, inputClass } from "@/components/ui/styles";
import type { SplitBillFilters } from "../schemas/split-bill-filters";

export function activeSplitBillFilterCount(filters: SplitBillFilters) {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.status && filters.status !== "all") count += 1;
  if (filters.month) count += 1;
  if (filters.sort !== "billDate") count += 1;
  if (filters.direction !== "desc") count += 1;
  return count;
}

export function SplitBillFilterBar({
  filters,
}: {
  filters: SplitBillFilters;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(filters.status ?? "");
  const [month, setMonth] = useState(filters.month ?? "");
  const [sort, setSort] = useState(filters.sort);
  const [direction, setDirection] = useState(filters.direction);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const count = activeSplitBillFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  return (
    <form
      className="flex items-stretch gap-[.55rem]"
      id="split-bill-filters-form"
      method="get"
      role="search"
    >
      <input
        aria-label="Search merchant"
        className={`${inputClass} flex-1 min-w-0`}
        defaultValue={filters.q}
        name="q"
        placeholder="Search merchant"
        type="search"
      />
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open filters"
        className={`${iconButtonClass} relative w-[2.9rem] min-h-[2.9rem] shrink-0`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={19} />
        {count > 0 ? <span className="absolute -top-[.3rem] -right-[.3rem] grid min-w-[1.1rem] h-[1.1rem] place-items-center rounded-full bg-primary-600 px-[.25rem] text-[.66rem] font-medium text-white">{count}</span> : null}
      </button>
      <input name="status" type="hidden" value={status} />
      <input name="month" type="hidden" value={month} />
      <input name="sort" type="hidden" value={sort} />
      <input name="direction" type="hidden" value={direction} />
      <input name="pageSize" type="hidden" value={filters.pageSize} />

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgb(15_23_42/45%)] p-4 min-[861px]:items-center" onClick={() => setOpen(false)}>
          <div
            aria-labelledby="split-filter-title"
            aria-modal="true"
            className="w-[min(34rem,100%)] max-h-[88vh] overflow-y-auto rounded-[1.25rem_1.25rem_1.1rem_1.1rem] border border-border bg-surface p-[1.25rem] shadow-card"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="split-filter-title">Filter Split Bill</h2>
              <button
                aria-label="Close filters"
                className={iconButtonClass}
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="grid gap-[.9rem]">
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Status</span>
                <Select
                  aria-label="Status"
                  onChange={(event) => setStatus(event.target.value)}
                  value={status}
                >
                  <option value="">Active</option>
                  <option value="draft">Draft</option>
                  <option value="finalized">Final</option>
                  <option value="archived">Archived</option>
                  <option value="all">All</option>
                </Select>
              </label>
              <div className={fieldClass}>
                <span className="text-[.86rem] font-medium">Bill month</span>
                <MonthSelector month={month} onChange={setMonth} />
              </div>
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Sort by</span>
                <Select
                  aria-label="Sort by"
                  onChange={(event) =>
                    setSort(event.target.value as SplitBillFilters["sort"])
                  }
                  value={sort}
                >
                  <option value="billDate">Date</option>
                  <option value="amount">Amount</option>
                </Select>
              </label>
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Sort order</span>
                <Select
                  aria-label="Sort order"
                  onChange={(event) =>
                    setDirection(
                      event.target.value as SplitBillFilters["direction"],
                    )
                  }
                  value={direction}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </Select>
              </label>
            </div>
            <div className="mt-[1.25rem] flex gap-[.55rem]">
              <Link className={buttonClass("secondary", "flex-1 justify-center")} href="/split-bills">
                Reset
              </Link>
              <button className={buttonClass("primary", "flex-1 justify-center")} type="submit">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
