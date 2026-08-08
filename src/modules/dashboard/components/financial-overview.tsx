"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

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
      className="-mx-[clamp(1.25rem,4vw,2.75rem)] -mt-4"
    >
      <div className="rounded-b-[1.6rem] border border-border bg-surface px-[1.15rem] pb-[1.3rem] shadow-card">
        <div className="flex items-center justify-between gap-[.6rem]">
          <h1 className="m-0 min-w-0 truncate text-[clamp(1.15rem,4vw,1.35rem)] font-medium leading-[1.15] tracking-[-.02em]">
            Halo,{" "}
            <span className="text-primary-700 dark:text-[#93c5fd]">{name}</span>
          </h1>
          <button
            type="button"
            className="icon-button financial-overview-eye shrink-0"
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
        <div className="mt-[.9rem] mb-[.85rem] h-px bg-border" aria-hidden="true" />
        <div className="grid grid-cols-2">
          <div className="grid min-w-0 content-start gap-[.2rem]">
            <span className="text-muted text-[.78rem] font-medium uppercase tracking-[.02em]">
              Pendapatan
            </span>
            <strong
              className={cn(
                "min-w-0 text-income text-[clamp(1.1rem,4.5vw,1.6rem)] leading-[1.25] tracking-[-.03em] [overflow-wrap:anywhere]",
                hidden && "text-foreground tracking-[.12em]",
              )}
            >
              {hidden ? PRIVACY_MASK : formatIdr(income)}
            </strong>
          </div>
          <div className="grid min-w-0 content-start gap-[.2rem] border-l border-border pl-4">
            <span className="text-muted text-[.78rem] font-medium uppercase tracking-[.02em]">
              Pengeluaran
            </span>
            <strong
              className={cn(
                "min-w-0 text-expense text-[clamp(1.1rem,4.5vw,1.6rem)] leading-[1.25] tracking-[-.03em] [overflow-wrap:anywhere]",
                hidden && "text-foreground tracking-[.12em]",
              )}
            >
              {hidden ? PRIVACY_MASK : formatIdr(expense)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
