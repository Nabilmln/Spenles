import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";

export function TransactionSummary({
  income,
  expense,
  savings,
}: {
  income: bigint;
  expense: bigint;
  savings: bigint;
}) {
  return (
    <section
      aria-label="Ringkasan periode"
      className={cn(cardClass, "flex items-stretch shadow-none")}
    >
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[.3rem] p-[.9rem_.35rem] border-l border-border text-center first:border-l-0">
        <ArrowDownLeft aria-hidden="true" className="size-[1.15rem] text-income" />
        <strong className="wrap-anywhere text-[clamp(.72rem,3.4vw,.95rem)] font-medium tracking-[-.01em] text-income">
          + {formatIdr(income)}
        </strong>
        <span className="text-[.68rem] font-medium text-muted">Pendapatan</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[.3rem] p-[.9rem_.35rem] border-l border-border text-center first:border-l-0">
        <ArrowUpRight aria-hidden="true" className="size-[1.15rem] text-expense" />
        <strong className="wrap-anywhere text-[clamp(.72rem,3.4vw,.95rem)] font-medium tracking-[-.01em] text-expense">
          − {formatIdr(expense)}
        </strong>
        <span className="text-[.68rem] font-medium text-muted">Pengeluaran</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[.3rem] p-[.9rem_.35rem] border-l border-border text-center first:border-l-0">
        <PiggyBank aria-hidden="true" className="size-[1.15rem] text-primary-600" />
        <strong className="wrap-anywhere text-[clamp(.72rem,3.4vw,.95rem)] font-medium tracking-[-.01em] text-primary-700">
          {savings < 0n ? "− " : ""}
          {formatIdr(savings < 0n ? -savings : savings)}
        </strong>
        <span className="text-[.68rem] font-medium text-muted">Tabungan</span>
      </div>
    </section>
  );
}
