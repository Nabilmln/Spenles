"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Select } from "@/components/ui/select";
import { MonthSelector } from "@/components/ui/month-selector";
import { buttonClass, fieldClass, iconButtonClass, inputClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
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
  const count = activeSplitBillFilterCount(filters);

  return (
    <form
      className="flex items-stretch gap-[.55rem]"
      id="split-bill-filters-form"
      method="get"
      role="search"
    >
      <input
        aria-label="Search merchant"
        className={cn(
          inputClass,
          "flex-1 min-w-0 rounded-full bg-white! dark:bg-surface!",
        )}
        defaultValue={filters.q}
        name="q"
        placeholder="Search merchant"
        type="search"
      />
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open filters"
        className={cn(
          iconButtonClass,
          "relative size-[2.9rem] min-h-[2.9rem] rounded-full bg-white! dark:bg-surface!",
        )}
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

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filter Split Bill"
        ariaLabel="Filter Split Bill"
      >
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

        <div className="mt-[1.35rem] grid grid-cols-2 gap-[.55rem] mb-5">
          <Link
            className={cn(buttonClass("secondary"), "justify-center")}
            href="/split-bills"
          >
            Reset
          </Link>
          <button
            className={cn(buttonClass("primary"), "justify-center")}
            form="split-bill-filters-form"
            type="submit"
          >
            Apply Filters
          </button>
        </div>
      </BottomSheet>
    </form>
  );
}