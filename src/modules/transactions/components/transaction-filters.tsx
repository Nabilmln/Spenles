"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { buttonClass, fieldClass, iconButtonClass, inputClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { DateRangeField } from "./date-range-field";

export function activeFilterCount(filters: TransactionFilters) {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.type) count += 1;
  if (filters.category) count += 1;
  if (filters.account) count += 1;
  if (filters.month || filters.from) count += 1;
  if (filters.sort !== "transactionAt") count += 1;
  if (filters.direction !== "desc") count += 1;
  return count;
}

export function TransactionFilterBar({
  filters,
  accounts,
  categories,
}: {
  filters: TransactionFilters;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: "income" | "expense" }[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(filters.type ?? "");
  const [category, setCategory] = useState(filters.category ?? "");
  const [account, setAccount] = useState(filters.account ?? "");
  const [sort, setSort] = useState(filters.sort);
  const [direction, setDirection] = useState(filters.direction);
  const count = activeFilterCount(filters);

  return (
    <form
      className="flex items-stretch gap-[.55rem]"
      id="transaction-filters-form"
      method="get"
      role="search"
    >
      <input
        aria-label="Search description or category"
        className={cn(inputClass, "flex-1 min-w-0")}
        defaultValue={filters.q}
        name="q"
        placeholder="Search description or category"
        type="search"
      />
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open filters"
        className={cn(iconButtonClass, "relative size-[2.9rem] min-h-[2.9rem]")}
        onClick={() => setOpen(true)}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={19} />
        {count > 0 ? <span className="absolute -top-[.3rem] -right-[.3rem] grid min-w-[1.1rem] h-[1.1rem] place-items-center rounded-full bg-primary-600 px-1 text-[.66rem] font-medium text-white">{count}</span> : null}
      </button>
      <input name="type" type="hidden" value={type} />
      <input name="category" type="hidden" value={category} />
      <input name="account" type="hidden" value={account} />
      <input name="sort" type="hidden" value={sort} />
      <input name="direction" type="hidden" value={direction} />
      {!open ? (
        <>
          <input name="month" type="hidden" value={filters.month ?? ""} />
          <input name="from" type="hidden" value={filters.from ?? ""} />
          <input name="to" type="hidden" value={filters.to ?? ""} />
        </>
      ) : null}
      <input name="pageSize" type="hidden" value={filters.pageSize} />

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgb(15_23_42/45%)] p-4 min-[861px]:items-center" onClick={() => setOpen(false)}>
          <div
            aria-labelledby="tx-filter-title"
            aria-modal="true"
            className="max-h-[88vh] w-full max-w-[34rem] overflow-y-auto rounded-t-[1.25rem] rounded-b-[1.1rem] border border-border bg-surface p-5 shadow-card min-[861px]:rounded-[1.25rem_1.25rem_1.1rem_1.1rem]"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="m-0 text-[1.05rem] tracking-[-.02em]" id="tx-filter-title">Filter transactions</h2>
              <button
                aria-label="Close filters"
                className={iconButtonClass}
                onClick={() => setOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="grid gap-[.9rem]">
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Transaction type</span>
                <Select
                  aria-label="Transaction type"
                  onChange={(event) => setType(event.target.value)}
                  value={type}
                >
                  <option value="">All types</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Select>
              </label>
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Category</span>
                <Select
                  aria-label="Category"
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Account</span>
                <Select
                  aria-label="Account"
                  onChange={(event) => setAccount(event.target.value)}
                  value={account}
                >
                  <option value="">All accounts</option>
                  {accounts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <div className={fieldClass}>
                <span className="text-[.86rem] font-medium">Period</span>
                <DateRangeField month={filters.month} from={filters.from} to={filters.to} />
              </div>
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Sort</span>
                <select
                  aria-label="Sort"
                  className={inputClass}
                  onChange={(event) => setSort(event.target.value as TransactionFilters["sort"])}
                  value={sort}
                >
                  <option value="transactionAt">Date</option>
                  <option value="amount">Amount</option>
                </select>
              </label>
              <label className={fieldClass}>
                <span className="text-[.86rem] font-medium">Sort direction</span>
                <select
                  aria-label="Sort direction"
                  className={inputClass}
                  onChange={(event) => setDirection(event.target.value as TransactionFilters["direction"])}
                  value={direction}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </label>
            </div>
            <div className="mt-[1.25rem] flex gap-[.55rem]">
              <Link className={cn(buttonClass("secondary"), "flex-1 justify-center")} href="/transactions">
                Reset
              </Link>
              <button className={cn(buttonClass("primary"), "flex-1 justify-center")} type="submit">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
