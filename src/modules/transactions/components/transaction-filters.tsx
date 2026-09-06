"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, SlidersHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  buttonClass,
  fieldClass,
  iconButtonClass,
  inputClass,
} from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { DateRangeField } from "./date-range-field";

export function activeFilterCount(filters: TransactionFilters) {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.type) count += 1;
  if (filters.category?.length) count += filters.category.length;
  if (filters.account) count += 1;
  if (filters.month || filters.from) count += 1;
  return count;
}

type CategoryOption = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
};

type AccountOption = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "expense", label: "Payment" },
  { value: "income", label: "Income" },
] as const;

function segmentedClass(active: boolean) {
  return cn(
    "flex-1 min-h-[2.6rem] cursor-pointer items-center justify-center rounded-[.7rem] border border-transparent px-[.5rem] py-[.55rem] text-[.82rem] font-medium text-muted transition-[background,color] duration-150",
    active
      ? "bg-primary-600 text-white shadow-[0_2px_10px_rgb(79_70_229/25%)]"
      : "bg-surface-subtle hover:bg-surface-subtle hover:text-foreground",
  );
}

function fieldButtonClass() {
  return cn(
    inputClass,
    "flex min-h-[2.9rem] items-center justify-between gap-[.5rem] rounded-[.72rem] bg-white! p-[.72rem_.85rem] dark:bg-surface!",
  );
}

export function TransactionFilterBar({
  filters,
  accounts,
  categories,
}: {
  filters: TransactionFilters;
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);
  const [accountSheet, setAccountSheet] = useState(false);
  const [type, setType] = useState(filters.type ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.category ?? [],
  );
  const [account, setAccount] = useState(filters.account ?? "");
  const count = activeFilterCount(filters);

  const sortedCategories = [...categories].sort((left, right) =>
    left.name.toLocaleLowerCase().localeCompare(right.name.toLocaleLowerCase()),
  );
  const selectedCategoryNames = categories
    .filter((item) => selectedCategories.includes(item.id))
    .map((item) => item.name);

  function toggleCategory(id: string) {
    setSelectedCategories((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <form
      className="flex items-stretch gap-[.55rem]"
      id="transaction-filters-form"
      method="get"
      role="search"
    >
      <input
        aria-label="Search description or category"
        className={cn(inputClass, "flex-1 min-w-0 rounded-full bg-white! dark:bg-surface!")}
        defaultValue={filters.q}
        name="q"
        placeholder="Search transactions..."
        type="search"
      />
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open filters"
        className={cn(iconButtonClass, "relative size-[2.9rem] min-h-[2.9rem] rounded-full bg-white! dark:bg-surface!")}
        onClick={() => setOpen(true)}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={19} />
        {count > 0 ? (
          <span className="absolute -top-[.3rem] -right-[.3rem] grid min-w-[1.1rem] h-[1.1rem] place-items-center rounded-full bg-primary-600 px-1 text-[.66rem] font-medium text-white">
            {count}
          </span>
        ) : null}
      </button>
      <input name="type" type="hidden" value={type} />
      {selectedCategories.map((id) => (
        <input key={id} name="category" type="hidden" value={id} />
      ))}
      <input name="account" type="hidden" value={account} />
      <input name="sort" type="hidden" value="transactionAt" />
      <input name="direction" type="hidden" value="desc" />
      <input name="month" type="hidden" value={filters.month ?? ""} />
      <input name="from" type="hidden" value={filters.from ?? ""} />
      <input name="to" type="hidden" value={filters.to ?? ""} />
      <input name="pageSize" type="hidden" value={filters.pageSize} />

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filter transactions"
        ariaLabel="Filter transactions"
      >
        <div className="grid gap-[1.15rem]">
          <div className={fieldClass}>
            <span className="text-[.86rem] font-medium">Transaction type</span>
            <div className="flex gap-[.4rem]" role="group" aria-label="Transaction type">
              {TYPE_OPTIONS.map((option) => (
                <button
                  aria-pressed={type === option.value}
                  className={segmentedClass(type === option.value)}
                  key={option.value}
                  onClick={() => setType(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={fieldClass}>
            <span className="text-[.86rem] font-medium">Category</span>
            <button
              className={fieldButtonClass()}
              onClick={() => setCategorySheet(true)}
              type="button"
            >
              <span className="min-w-0 truncate text-left">
                {selectedCategoryNames.length === 0
                  ? "Choose Category"
                  : selectedCategoryNames.length > 2
                    ? `${selectedCategoryNames.slice(0, 2).join(", ")} +${selectedCategoryNames.length - 2}`
                    : selectedCategoryNames.join(", ")}
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
            </button>
          </div>

          <div className={fieldClass}>
            <span className="text-[.86rem] font-medium">Account</span>
            <button
              className={fieldButtonClass()}
              onClick={() => setAccountSheet(true)}
              type="button"
            >
              <span className="min-w-0 truncate text-left">
                {account
                  ? accounts.find((item) => item.id === account)?.name ?? "All Accounts"
                  : "All Accounts"}
              </span>
              <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
            </button>
          </div>

          <div className={fieldClass}>
            <span className="text-[.86rem] font-medium">Date</span>
            <DateRangeField month={filters.month} from={filters.from} to={filters.to} />
          </div>
        </div>

        <div className="mt-[1.35rem] mb-4 grid grid-cols-2 gap-[.55rem]">
          <Link
            className={cn(buttonClass("secondary"), "justify-center")}
            href="/transactions"
          >
            Reset
          </Link>
          <button
            className={cn(buttonClass("primary"), "justify-center")}
            form="transaction-filters-form"
            type="submit"
          >
            Apply Filters
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={categorySheet}
        onClose={() => setCategorySheet(false)}
        title="Choose Category"
        ariaLabel="Choose category"
        zIndex="z-[85]"
      >
        <div className="grid max-h-[60vh] gap-[.5rem] overflow-y-auto">
          {sortedCategories.map((item) => {
            const Icon = resolveCategoryIcon(item.id, item.name, item.icon);
            const selected = selectedCategories.includes(item.id);
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "flex min-h-[2.7rem] w-full cursor-pointer items-center gap-[.6rem] rounded-[.7rem] border px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors",
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-border bg-surface hover:bg-surface-subtle",
                )}
                key={item.id}
                onClick={() => toggleCategory(item.id)}
                type="button"
              >
                <Icon
                  aria-hidden="true"
                  size={18}
                  className="shrink-0 text-primary-600"
                />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                {selected ? (
                  <Check aria-hidden="true" className="shrink-0" size={18} />
                ) : null}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet
        open={accountSheet}
        onClose={() => setAccountSheet(false)}
        title="Select Account"
        ariaLabel="Select account"
        zIndex="z-[85]"
      >
        <div className="grid max-h-[60vh] gap-[.4rem] overflow-y-auto">
          <button
            aria-pressed={account === ""}
            className={cn(
              "flex min-h-[2.7rem] w-full cursor-pointer items-center justify-between gap-[.6rem] rounded-[.7rem] border px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors",
              account === ""
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-border bg-surface hover:bg-surface-subtle",
            )}
            onClick={() => {
              setAccount("");
              setAccountSheet(false);
            }}
            type="button"
          >
            <span>All Accounts</span>
            {account === "" ? <Check aria-hidden="true" size={18} /> : null}
          </button>
          {accounts.map((item) => {
            const selected = account === item.id;
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "flex min-h-[2.7rem] w-full cursor-pointer items-center justify-between gap-[.6rem] rounded-[.7rem] border px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors",
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-border bg-surface hover:bg-surface-subtle",
                )}
                key={item.id}
                onClick={() => {
                  setAccount(item.id);
                  setAccountSheet(false);
                }}
                type="button"
              >
                <span className="min-w-0 truncate">{item.name}</span>
                {selected ? <Check aria-hidden="true" size={18} /> : null}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </form>
  );
}