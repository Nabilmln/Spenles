"use client";

import { useState } from "react";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";
import type { IncomeExpensePoint } from "../types/dashboard";
import { IncomeExpenseChart } from "./income-expense-chart";

export type CashFlowSeries = {
  points: IncomeExpensePoint[];
  totalIncome: string;
  totalExpense: string;
};

type CashFlowView = "daily" | "weekly" | "monthly";

const VIEWS: Array<{ id: CashFlowView; label: string }> = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const VIEW_DESCRIPTIONS: Record<CashFlowView, string> = {
  daily: "Income and expenses in the last 7 days.",
  weekly: "Income and expenses in the last 4 weeks.",
  monthly: "Income and expenses in the last 12 months.",
};

export function CashFlowOverviewCard({
  daily,
  weekly,
  monthly,
}: {
  daily: CashFlowSeries;
  weekly: CashFlowSeries;
  monthly: CashFlowSeries;
}) {
  const [view, setView] = useState<CashFlowView>("monthly");
  const series =
    view === "daily" ? daily : view === "weekly" ? weekly : monthly;
  const hasData =
    BigInt(series.totalIncome) > 0n || BigInt(series.totalExpense) > 0n;

  return (
    <section
      aria-label="Cash flow"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={eyebrowClass}>Cash flow</p>
        </div>
        <div
          aria-label="Cash flow range"
          className="inline-flex shrink-0 rounded-[.7rem] bg-surface-subtle p-[.25rem]"
          role="group"
        >
          {VIEWS.map((option) => (
            <button
              aria-pressed={view === option.id}
              className={cn(
                "rounded-[.55rem] px-[.8rem] py-[.35rem] text-[.78rem] font-medium text-muted transition-[background,color] duration-150 hover:text-foreground",
                view === option.id && "bg-surface text-foreground shadow-card",
              )}
              key={option.id}
              onClick={() => setView(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="m-0 mt-[.35rem] text-[.84rem] text-muted">
        {VIEW_DESCRIPTIONS[view]}
      </p>
      <strong className="mt-[.35rem] text-[.88rem]">
        Total income {formatIdr(series.totalIncome)} · Total expenses{" "}
        {formatIdr(series.totalExpense)}
      </strong>

      <IncomeExpenseChart points={series.points} />

      {!hasData ? (
        <p
          className="m-0 -mt-[.25rem] rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.78rem] text-muted"
          role="status"
        >
          No transactions yet for this period.
        </p>
      ) : null}

      <p className="sr-only">
        {series.points
          .map(
            (point) =>
              `${point.label}: Income ${formatIdr(point.incomeIdr)}, Expense ${formatIdr(point.expenseIdr)}`,
          )
          .join(". ")}
      </p>
    </section>
  );
}