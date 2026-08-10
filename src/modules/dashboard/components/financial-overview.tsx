"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { eyebrowClass, iconButtonClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

const metricLabelClass =
  "text-muted text-[.78rem] font-medium uppercase tracking-[.02em]";

const metricValueClass =
  "min-w-0 block text-[clamp(1.05rem,4vw,1.5rem)] leading-[1.25] tracking-[-.03em] [overflow-wrap:anywhere] min-[861px]:text-[1.3rem]";

function MetricValue({
  hidden,
  value,
  tone,
}: {
  hidden: boolean;
  value: string;
  tone: "income" | "expense" | "net-positive" | "net-negative";
}) {
  const toneClass = {
    income: "text-income",
    expense: "text-expense",
    "net-positive": "text-primary-700 dark:text-[#93c5fd]",
    "net-negative": "text-expense",
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
  net,
  name,
}: {
  income: string;
  expense: string;
  net: string;
  name: string;
}) {
  const [hidden, setHidden] = useState(false);
  const netNegative = BigInt(net) < 0n;

  return (
    <section
      aria-label="Ringkasan keuangan"
      className="-mx-[clamp(1.25rem,4vw,2.75rem)] -mt-4 min-[861px]:mx-0 min-[861px]:-mt-0"
    >
      <div className="grid rounded-b-[1.6rem] border border-border bg-surface px-[1.15rem] pb-[1.3rem] shadow-card min-[861px]:rounded-2xl min-[861px]:px-[1.6rem] min-[861px]:py-[1.5rem]">
        <div className="min-w-0">
          <p className={`${eyebrowClass} hidden mb-[.4rem] min-[861px]:block`}>
            Dashboard
          </p>
          <div className="flex items-center justify-between gap-[.6rem]">
            <h1 className="m-0 min-w-0 truncate text-[clamp(1.15rem,4vw,1.35rem)] font-medium leading-[1.15] tracking-[-.02em] min-[861px]:text-[clamp(1.5rem,3vw,2rem)]">
              Halo,{" "}
              <span className="text-primary-700 dark:text-[#93c5fd]">{name}</span>
            </h1>
            <button
              type="button"
              className={`${iconButtonClass} shrink-0 hover:text-primary-700 dark:hover:text-[#93c5fd]`}
              aria-label={hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
              aria-pressed={hidden}
              onClick={() => setHidden((value) => !value)}
            >
              {hidden ? (
                <EyeOff size={19} aria-hidden="true" />
              ) : (
                <Eye size={19} aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="hidden m-0 mt-[.35rem] text-muted min-[861px]:block">
            Ringkasan pribadi dalam IDR dengan batas waktu Asia/Jakarta.
          </p>
        </div>

        <div className="mt-[.9rem] mb-[.85rem] h-px bg-border min-[861px]:hidden" aria-hidden="true" />

        <div className="grid min-w-0 grid-cols-2 gap-x-4 min-[861px]:mt-[1.1rem] min-[861px]:grid-cols-3 min-[861px]:gap-x-6">
          <div className="grid min-w-0 content-start gap-[.2rem]">
            <span className={metricLabelClass}>Pendapatan</span>
            <MetricValue hidden={hidden} tone="income" value={income} />
          </div>
          <div className="grid min-w-0 content-start gap-[.2rem] border-l border-border pl-4 min-[861px]:pl-0">
            <span className={metricLabelClass}>Pengeluaran</span>
            <MetricValue hidden={hidden} tone="expense" value={expense} />
          </div>
          <div className="col-span-2 mt-[.9rem] grid min-w-0 content-start gap-[.2rem] border-t border-border pt-[.9rem] min-[861px]:col-span-1 min-[861px]:mt-0 min-[861px]:border-0 min-[861px]:pt-0 min-[861px]:border-l min-[861px]:border-border min-[861px]:pl-6">
            <span className={metricLabelClass}>Arus kas bersih</span>
            <MetricValue
              hidden={hidden}
              tone={netNegative ? "net-negative" : "net-positive"}
              value={net}
            />
          </div>
        </div>
      </div>
    </section>
  );
}