"use client";

import Link from "next/link";
import { useState } from "react";
import { ChartPie, LoaderCircle, Percent } from "lucide-react";
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
          <table aria-label="Category breakdown" className="mt-[.75rem] w-full table-fixed border-collapse text-[.76rem]">
            <colgroup>
              <col className="w-5" />
              <col />
              <col className="w-[3.25rem]" />
              <col className="w-[5.5rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-[.7rem] font-medium text-muted">
                <th scope="col" className="pb-2 text-left"><span className="sr-only">Mark</span></th>
                <th scope="col" className="pb-2 text-center font-medium">Category</th>
                <th scope="col" className="pb-2 text-center font-medium">
                  <span className="sr-only">Percentage</span>
                  <Percent aria-hidden="true" className="mx-auto" size={14} strokeWidth={1.8} />
                </th>
                <th scope="col" className="pb-2 text-center font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {activeCategories.map((category, index) => {
                const share = percent(category.amountIdr, total);
                const shareLabel = share.toLocaleString("en-US");
                return (
                  <tr className="border-b border-border last:border-b-0" key={category.categoryId}>
                    <td className="py-[.65rem] align-middle">
                      <span aria-hidden="true" className="block size-[.55rem] rounded-full" style={{ backgroundColor: slices[index].fill }} />
                    </td>
                    <th scope="row" className="min-w-0 py-[.65rem] pr-1 text-left font-medium align-middle">
                      <Link
                        className="block truncate text-foreground underline-offset-2 hover:underline focus-visible:underline"
                        href={`/reports/categories/${category.categoryId}?from=${from}&to=${to}`}
                        title={category.name}
                      >
                        {category.name}
                      </Link>
                    </th>
                    <td className="py-[.65rem] text-center align-middle">
                      <span aria-label={`${shareLabel} percent`} className="inline-flex min-w-[2.25rem] justify-center rounded-[.38rem] bg-primary-700 px-[.35rem] py-[.2rem] text-[.69rem] font-semibold tabular-nums text-white">
                        {shareLabel}
                      </span>
                    </td>
                    <td className="py-[.65rem] pl-1 text-right font-medium leading-snug align-middle tabular-nums text-foreground [overflow-wrap:anywhere]">
                      {formatIdr(category.amountIdr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : busy ? (
        <div
          className="mt-4 grid min-h-[10rem] place-items-center rounded-[1.12rem] border border-dashed border-border bg-surface-subtle p-4 text-center text-[.84rem] text-muted"
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
