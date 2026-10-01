"use client";

import Link from "next/link";
import { useState } from "react";
import { ChartPie, LoaderCircle } from "lucide-react";
import { cardClass, segmentedOptionClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";
import { getCategoryBreakdownAction } from "../actions/category-breakdown";
import {
  ReportCategoryChart,
  type ReportCategorySlice,
} from "./report-category-chart";

export type CategoryBreakdownItem = {
  categoryId: string;
  name: string;
  amountIdr: string;
  shareBps: number;
};

const SLICE_COLORS = [
  "#171717",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#787872",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
  "#64748b",
] as const;

const typeOptions = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
] as const;

function percent(amount: string, total: bigint) {
  return total === 0n ? 0 : Number((BigInt(amount) * 10_000n) / total) / 100;
}

export function CategoryAnalysis({
  from,
  to,
  type,
  totalIdr,
  categories,
}: {
  from: string;
  to: string;
  type: "income" | "expense";
  totalIdr: string;
  categories: CategoryBreakdownItem[];
}) {
  const [view, setView] = useState<{
    type: "income" | "expense";
    totalIdr: string;
    categories: CategoryBreakdownItem[];
  } | null>(null);
  const [pendingType, setPendingType] = useState<"income" | "expense" | null>(
    null,
  );

  const activeType = view?.type ?? type;
  const activeTotalIdr = view?.totalIdr ?? totalIdr;
  const activeCategories = view?.categories ?? categories;
  const total = BigInt(activeTotalIdr);
  const slices: ReportCategorySlice[] = activeCategories.map(
    (category, index) => ({
      name: category.name,
      amountIdr: category.amountIdr,
      shareBps: category.shareBps,
      fill: SLICE_COLORS[index % SLICE_COLORS.length],
    }),
  );
  const busy = pendingType !== null;

  async function select(nextType: "income" | "expense") {
    if (nextType === activeType || busy) return;
    setPendingType(nextType);
    const result = await getCategoryBreakdownAction({
      from,
      to,
      categoryType: nextType,
    });
    if (result.ok) {
      setView({
        type: result.type,
        totalIdr: result.totalIdr,
        categories: result.categories,
      });
      const url = new URL(window.location.href);
      url.searchParams.set("categoryType", nextType);
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    }
    setPendingType(null);
  }

  return (
    <section
      aria-label={
        activeType === "income" ? "Income by Category" : "Expense by Category"
      }
      className={cn(cardClass, "shadow-none")}
    >
      <div
        className="mb-4 inline-flex w-full gap-[.25rem] rounded-full bg-surface-subtle p-[.25rem]"
        role="group"
        aria-label="Transaction type"
      >
        {typeOptions.map((option) => {
          const active = activeType === option.value;
          const loading = pendingType === option.value;
          return (
            <button
              aria-pressed={active}
              className={segmentedOptionClass(active, busy && !active ? "cursor-wait opacity-70" : undefined)}
              disabled={busy}
              key={option.value}
              onClick={() => select(option.value)}
              type="button"
            >
              {loading && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              {option.label}
            </button>
          );
        })}
      </div>

      {activeCategories.length ? (
        <div aria-busy={busy} className={cn(busy && "opacity-60")}>
          <ReportCategoryChart slices={slices} />
          <div className="grid mt-[.75rem]">
            {activeCategories.map((category) => {
              const share = percent(category.amountIdr, total);
              return (
                <Link
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[.9rem] border-b border-border p-[.8rem_0] last:border-b-0"
                  href={`/reports/categories/${category.categoryId}?from=${from}&to=${to}`}
                  key={category.categoryId}
                >
                  <span className="truncate">{category.name}</span>
                  <strong>{formatIdr(category.amountIdr)}</strong>
                  <small className="text-[.78rem] text-muted">
                    {share.toLocaleString("en-US")}%
                  </small>
                </Link>
              );
            })}
          </div>
        </div>
      ) : busy ? (
        <div
          className="mt-4 grid min-h-[10rem] place-items-center rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-4 text-center text-[.84rem] text-muted"
          role="status"
        >
          Loading...
        </div>
      ) : (
        <div
          className="mt-4 flex min-h-[16rem] flex-col items-center justify-center px-5 text-center"
          role="status"
        >
          <span className="mb-4 grid size-14 place-items-center rounded-full bg-surface-subtle text-foreground" aria-hidden="true">
            <ChartPie className="size-7" strokeWidth={1.6} />
          </span>
          <p className="m-0 text-[.9rem] font-medium text-foreground">
            No {activeType === "income" ? "income" : "expenses"} to break down
          </p>
          <p className="mt-1 max-w-[17rem] text-[.85rem] leading-relaxed text-muted">
            {activeType === "income"
              ? "Income categories will appear here when you record income in this period."
              : "Expense categories will appear here when you record an expense in this period."}
          </p>
        </div>
      )}
    </section>
  );
}
