import {
  buttonClass,
  cardClass,
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
    <section aria-label="Pengeluaran bulanan" className={`${cardClass} shadow-none`}>
      <div className="flex justify-center">
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
              {monthLabel}
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
