"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { eyebrowClass, iconButtonClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

const metricLabelClass =
  "text-muted text-[.7rem] font-semibold uppercase tracking-[.08em]";

const metricValueClass =
  "min-w-0 block text-[clamp(.95rem,3.5vw,1.35rem)] leading-[1.2] tracking-[-.03em] [overflow-wrap:anywhere] min-[861px]:text-[1.15rem]";

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
      aria-label="Ringkasan keuangan"
      className="-mx-[clamp(1.25rem,4vw,2.75rem)] -mt-4 min-[861px]:mx-0 min-[861px]:-mt-0"
    >
      <div className="grid rounded-b-[.85rem] border border-border bg-surface px-[1rem] pb-[1rem] shadow-card min-[861px]:rounded-[.85rem] min-[861px]:px-[1.25rem] min-[861px]:py-[1.1rem]">
        <div className="min-w-0">
          <p className={`${eyebrowClass} hidden mb-[.3rem] min-[861px]:block`}>
            Dashboard
          </p>
          <div className="flex items-center justify-between gap-[.5rem]">
            <h1 className="m-0 min-w-0 truncate text-[clamp(1rem,3.5vw,1.2rem)] font-medium leading-[1.15] tracking-[-.02em] min-[861px]:text-[clamp(1.25rem,2.5vw,1.65rem)]">
              Halo,{" "}
              <span className="text-primary-600 dark:text-primary-700">{name}</span>
            </h1>
            <button
              type="button"
              className={`${iconButtonClass} shrink-0`}
              aria-label={hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
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
          <p className="hidden m-0 mt-[.25rem] text-muted text-[.78rem] min-[861px]:block">
            Ringkasan pribadi dalam IDR dengan batas waktu Asia/Jakarta.
          </p>
        </div>

        <div className="mt-[.7rem] mb-[.65rem] h-px bg-border min-[861px]:hidden" aria-hidden="true" />

        <div className="grid min-w-0 grid-cols-2 gap-x-3 min-[861px]:mt-[.85rem] min-[861px]:gap-x-5">
          <div className="grid min-w-0 content-start gap-[.15rem]">
            <span className={metricLabelClass}>Pendapatan</span>
            <MetricValue hidden={hidden} tone="income" value={income} />
          </div>
          <div className="grid min-w-0 content-start gap-[.15rem] border-l border-border pl-3">
            <span className={metricLabelClass}>Pengeluaran</span>
            <MetricValue hidden={hidden} tone="expense" value={expense} />
          </div>
        </div>
      </div>
    </section>
  );
}