import {
  buttonClass,
  cardClass,
  eyebrowClass,
  fieldHintClass,
  iconButtonClass,
} from "@/components/ui/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatIdr } from "@/lib/money/format-idr";
import type { DailyExpensePoint } from "../types/dashboard";
import { DailyExpenseChart } from "./daily-expense-chart";

export function MonthlyExpenseCard({
  monthLabel,
  totalExpense,
  monthPoints,
  recentPoints,
  prevMonth,
  nextMonth,
  currentMonth,
}: {
  monthLabel: string;
  totalExpense: bigint;
  monthPoints: DailyExpensePoint[];
  recentPoints: DailyExpensePoint[];
  prevMonth: string;
  nextMonth: string;
  currentMonth: string;
}) {
  const recentZero = recentPoints.every((point) => point.expenseIdr === "0");
  return (
    <section aria-labelledby="monthly-expense-title" className={`${cardClass} shadow-none`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-4 max-[540px]:grid-cols-1 max-[540px]:gap-[.6rem]">
        <div className="min-w-0">
          <p className={eyebrowClass}>Ringkasan bulanan</p>
          <h2 id="monthly-expense-title" className="m-0 text-[1.15rem] tracking-[-.02em]">Pengeluaran Bulan {monthLabel}</h2>
        </div>
        <div className="flex items-center gap-[.45rem]" role="group" aria-label="Pilih bulan">
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={prevMonth} />
            <button
              aria-label="Bulan sebelumnya"
              className={`${iconButtonClass} size-10`}
              type="submit"
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
          </form>
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={currentMonth} />
            <button className={buttonClass("secondary")} type="submit">
              Bulan ini
            </button>
          </form>
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={nextMonth} />
            <button
              aria-label="Bulan berikutnya"
              className={`${iconButtonClass} size-10`}
              type="submit"
            >
              <ChevronRight aria-hidden="true" size={20} />
            </button>
          </form>
        </div>
      </div>
      <strong className="my-[1.1rem_.2rem] block text-[clamp(1.6rem,4vw,2.5rem)] tracking-[-.04em] [overflow-wrap:anywhere]">{formatIdr(totalExpense)}</strong>
      <div className="max-[860px]:hidden">
        <DailyExpenseChart points={monthPoints} />
      </div>
      <div className="hidden max-[860px]:block">
        <DailyExpenseChart points={recentPoints} />
        {recentZero ? (
          <p className="mt-[.35rem] text-[.78rem] font-medium text-muted" role="status">
            Belum ada pengeluaran dalam 4 hari terakhir.
          </p>
        ) : null}
      </div>
      <p className={fieldHintClass}>
        Grafik menampilkan pengeluaran per hari dalam zona Asia/Jakarta.
      </p>
    </section>
  );
}
