"use client";

import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { eyebrowClass, iconButtonClass } from "@/components/ui/styles";
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
      className="-mx-[clamp(1.25rem,4vw,2.75rem)] -mt-4 min-[861px]:mx-0 min-[861px]:-mt-0"
    >
      <div className="grid rounded-b-[1.6rem] border border-border bg-surface px-[1.15rem] pb-[1.3rem] shadow-card min-[861px]:grid-cols-[minmax(0,1fr)_minmax(19rem,auto)] min-[861px]:items-center min-[861px]:gap-8 min-[861px]:rounded-2xl min-[861px]:px-[1.6rem] min-[861px]:py-[1.5rem]">
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
          <div
            className="mt-[.9rem] mb-[.85rem] h-px bg-border min-[861px]:hidden"
            aria-hidden="true"
          />
        </div>
        <div className="grid grid-cols-2 min-[861px]:grid-cols-1 min-[861px]:grid-rows-2 min-[861px]:divide-y min-[861px]:divide-border min-[861px]:border-l min-[861px]:border-border min-[861px]:pl-6">
          <div className="grid min-w-0 content-start gap-[.2rem] min-[861px]:grid-cols-[auto_minmax(0,1fr)] min-[861px]:items-center min-[861px]:gap-[.55rem]">
            <ArrowDownLeft
              className="hidden size-[1.1rem] shrink-0 text-income min-[861px]:block"
              aria-hidden="true"
            />
            <div className="grid min-w-0 content-start gap-[.2rem] min-[861px]:py-[.85rem]">
              <span className="text-muted text-[.78rem] font-medium uppercase tracking-[.02em]">
                Pendapatan
              </span>
              <strong
                className={cn(
                  "min-w-0 text-income text-[clamp(1.1rem,4.5vw,1.6rem)] leading-[1.25] tracking-[-.03em] [overflow-wrap:anywhere] min-[861px]:text-[1.35rem]",
                  hidden && "text-foreground tracking-[.12em]",
                )}
              >
                {hidden ? PRIVACY_MASK : formatIdr(income)}
              </strong>
            </div>
          </div>
          <div className="grid min-w-0 content-start gap-[.2rem] border-l border-border pl-4 min-[861px]:grid-cols-[auto_minmax(0,1fr)] min-[861px]:items-center min-[861px]:gap-[.55rem] min-[861px]:border-l-0 min-[861px]:pl-0">
            <ArrowUpRight
              className="hidden size-[1.1rem] shrink-0 text-expense min-[861px]:block"
              aria-hidden="true"
            />
            <div className="grid min-w-0 content-start gap-[.2rem] min-[861px]:py-[.85rem]">
              <span className="text-muted text-[.78rem] font-medium uppercase tracking-[.02em]">
                Pengeluaran
              </span>
              <strong
                className={cn(
                  "min-w-0 text-expense text-[clamp(1.1rem,4.5vw,1.6rem)] leading-[1.25] tracking-[-.03em] [overflow-wrap:anywhere] min-[861px]:text-[1.35rem]",
                  hidden && "text-foreground tracking-[.12em]",
                )}
              >
                {hidden ? PRIVACY_MASK : formatIdr(expense)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}