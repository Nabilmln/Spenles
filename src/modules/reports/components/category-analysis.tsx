"use client";

import Link from "next/link";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";

export type CategoryBreakdownItem = {
  categoryId: string;
  name: string;
  amountIdr: string;
  shareBps: number;
};

function percent(amount: string, total: bigint) {
  return total === 0n ? 0 : Number((BigInt(amount) * 10_000n) / total) / 100;
}

const toggleBase =
  "flex-1 min-h-[2.6rem] cursor-pointer rounded-[.65rem] border border-border bg-surface-subtle px-[.8rem] font-medium text-muted transition-colors";

const toggleActive = "border-primary-600 bg-primary-600 text-white";

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
  const total = BigInt(totalIdr);

  function select(nextType: "income" | "expense") {
    const url = new URL(window.location.href);
    url.searchParams.set("categoryType", nextType);
    window.location.href = url.toString();
  }

  return (
    <section
      aria-label={type === "income" ? "Income by Category" : "Expense by Category"}
      className={cn(cardClass, "shadow-none")}
    >
      <div className="mb-4 flex items-center justify-between gap-4 max-[540px]:flex-col max-[540px]:items-stretch">
        <p className={`${eyebrowClass} mb-0`}>{type === "income" ? "Income" : "Expense"}</p>
        <div className="flex gap-[.5rem] max-[540px]:w-full" role="group" aria-label="Transaction type">
          <button
            aria-pressed={type === "expense"}
            className={cn(toggleBase, type === "expense" && toggleActive)}
            onClick={() => select("expense")}
            type="button"
          >
            Expense
          </button>
          <button
            aria-pressed={type === "income"}
            className={cn(toggleBase, type === "income" && toggleActive)}
            onClick={() => select("income")}
            type="button"
          >
            Income
          </button>
        </div>
      </div>

      {categories.length ? (
        <div className="grid">
          {categories.map((category) => {
            const share = percent(category.amountIdr, total);
            return (
              <Link
                className="grid grid-cols-[minmax(8rem,1fr)_minmax(6rem,2fr)_auto_auto] items-center gap-[.9rem] border-b border-border p-[.8rem_0] last:border-b-0 max-[720px]:grid-cols-[minmax(0,1fr)_auto]"
                href={`/reports/categories/${category.categoryId}?from=${from}&to=${to}`}
                key={category.categoryId}
              >
                <span>{category.name}</span>
                <span className="h-[.55rem] overflow-hidden rounded-full bg-surface-subtle max-[720px]:col-span-full max-[720px]:row-start-2" aria-hidden="true">
                  <i className="block h-full rounded-[inherit] bg-primary-600" style={{ width: `${Math.min(share, 100)}%` }} />
                </span>
                <strong>{formatIdr(category.amountIdr)}</strong>
                <small className="text-[.78rem] text-muted">{share.toLocaleString("en-US")}%</small>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid min-h-[10rem] place-items-center rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-4 text-center text-[.84rem] text-muted" role="status">
          No {type === "income" ? "income" : "expense"} in this period yet.
        </div>
      )}
    </section>
  );
}