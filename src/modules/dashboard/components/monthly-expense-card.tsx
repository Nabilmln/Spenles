import {
  buttonClass,
  cardClass,
  eyebrowClass,
  iconButtonClass,
} from "@/components/ui/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatIdr } from "@/lib/money/format-idr";
import type { DailyExpensePoint } from "../types/dashboard";
import { DailyExpenseChart } from "./daily-expense-chart";

export function MonthlyExpenseCard({
  monthLabel,
  totalIncome,
  totalExpense,
  monthPoints,
  recentPoints,
  prevMonth,
  nextMonth,
  currentMonth,
}: {
  monthLabel: string;
  totalIncome: bigint;
  totalExpense: bigint;
  monthPoints: DailyExpensePoint[];
  recentPoints: DailyExpensePoint[];
  prevMonth: string;
  nextMonth: string;
  currentMonth: string;
}) {
  return (
    <section aria-label="Pengeluaran bulanan" className={`${cardClass} shadow-none`}>
      <p className={`${eyebrowClass} pb-2 mb-[.4rem]`}>Arus Kas</p>
      <div className="flex justify-center">
        <div className="flex items-center gap-[.35rem]" role="group" aria-label="Pilih bulan">
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={prevMonth} />
            <button
              aria-label="Bulan sebelumnya"
              className={`${iconButtonClass} size-[2.2rem]`}
              type="submit"
            >
              <ChevronLeft aria-hidden="true" size={17} />
            </button>
          </form>
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={currentMonth} />
            <button className={buttonClass("secondary")} type="submit">
              {monthLabel}
            </button>
          </form>
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={nextMonth} />
            <button
              aria-label="Bulan berikutnya"
              className={`${iconButtonClass} size-[2.2rem]`}
              type="submit"
            >
              <ChevronRight aria-hidden="true" size={17} />
            </button>
          </form>
        </div>
      </div>
      <div className="my-[.85rem_0] grid grid-cols-2 gap-3">
        <div className="grid min-w-0 gap-[.15rem]">
          <span className="text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted">Pendapatan</span>
          <strong className="min-w-0 text-income text-[clamp(1.05rem,3.5vw,1.5rem)] tracking-[-.03em] [overflow-wrap:anywhere]">{formatIdr(totalIncome)}</strong>
        </div>
        <div className="grid min-w-0 gap-[.15rem]">
          <span className="text-[.72rem] font-semibold uppercase tracking-[.08em] text-muted">Pengeluaran</span>
          <strong className="min-w-0 text-expense text-[clamp(1.05rem,3.5vw,1.5rem)] tracking-[-.03em] [overflow-wrap:anywhere]">{formatIdr(totalExpense)}</strong>
        </div>
      </div>
      <div className="max-[860px]:hidden">
        <DailyExpenseChart points={monthPoints} />
      </div>
      <div className="hidden max-[860px]:block">
        <DailyExpenseChart points={recentPoints} />
      </div>
    </section>
  );
}