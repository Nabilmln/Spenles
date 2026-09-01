"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { iconButtonClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

const metricLabelClass =
  "text-muted text-[.7rem] font-semibold uppercase tracking-[.08em]";

const metricValueClass =
  "min-w-0 block text-[clamp(.95rem,3.5vw,1.35rem)] leading-[1.2] tracking-[-.03em] [overflow-wrap:anywhere] min-[861px]:text-[1.15rem]";

const eyebrowClass =
  "mb-[.3rem] text-[.7rem] font-semibold uppercase tracking-[.14em] text-primary-600 dark:text-primary-700";

const tileClass =
  "grid min-w-0 content-start gap-[.15rem] max-[860px]:rounded-[.8rem] max-[860px]:border max-[860px]:border-border max-[860px]:bg-surface max-[860px]:p-[.8rem] max-[860px]:shadow-card";

function MetricValue({
  hidden,
  value,
  tone,
}: {
  hidden: boolean;
  value: string;
  tone: "income" | "expense";
}) {
  const toneClass = {
    income: "text-income",
    expense: "text-expense",
  }[tone];
  return (
    <strong
      className={cn(
        metricValueClass,
        hidden && "text-foreground tracking-[.12em]",
        !hidden && toneClass,
      )}
    >
      {hidden ? PRIVACY_MASK : formatIdr(value)}
    </strong>
  );
}

export function FinancialOverview({
  income,
  expense,
  name,
}: {
  income: string;
  expense: string;
  name: string;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <section
      aria-label="Financial summary"
      className="-mx-[clamp(1.25rem,4vw,2.75rem)] mt-4 min-[861px]:mx-0 min-[861px]:-mt-0"
    >
      <div className="min-w-0 px-[1.15rem] min-[861px]:rounded-[.85rem] min-[861px]:border min-[861px]:border-border min-[861px]:bg-surface min-[861px]:px-[1.25rem] min-[861px]:py-[1.1rem] min-[861px]:shadow-card">
        <div className="min-w-0 max-[860px]:rounded-[.8rem] max-[860px]:border max-[860px]:border-border max-[860px]:bg-surface max-[860px]:p-[.8rem] max-[860px]:shadow-card">
          <p className={`${eyebrowClass} hidden min-[861px]:block`}>
            Dashboard
          </p>
          <div className="flex items-center justify-between gap-[.5rem]">
            <h1 className="m-0 min-w-0 truncate text-[clamp(1.05rem,4vw,1.3rem)] font-medium leading-[1.15] tracking-[-.02em] min-[861px]:text-[clamp(1.25rem,2.5vw,1.65rem)]">
              Hello,{" "}
              <span className="text-primary-600 dark:text-primary-700">{name}</span>
            </h1>
            <button
              type="button"
              className={`${iconButtonClass} shrink-0`}
              aria-label={hidden ? "Show amount" : "Hide amount"}
              aria-pressed={hidden}
              onClick={() => setHidden((value) => !value)}
            >
              {hidden ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-[.75rem] grid min-w-0 grid-cols-2 gap-3 min-[861px]:mt-[.85rem] min-[861px]:gap-x-5">
          <div className={tileClass}>
            <span className={metricLabelClass}>Income</span>
            <MetricValue hidden={hidden} tone="income" value={income} />
          </div>
          <div className={`${tileClass} min-[861px]:border-l min-[861px]:border-border min-[861px]:pl-5`}>
            <span className={metricLabelClass}>Expense</span>
            <MetricValue hidden={hidden} tone="expense" value={expense} />
          </div>
        </div>
      </div>
    </section>
  );
}