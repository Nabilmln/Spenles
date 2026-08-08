import { buttonClass } from "@/components/ui/styles";
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
    <section aria-labelledby="monthly-expense-title" className="monthly-expense-card card">
      <div className="monthly-expense-heading">
        <div>
          <p className="eyebrow">Ringkasan bulanan</p>
          <h2 id="monthly-expense-title">Pengeluaran Bulan {monthLabel}</h2>
        </div>
        <div className="month-nav" role="group" aria-label="Pilih bulan">
          <form action="/dashboard" method="get">
            <input name="month" type="hidden" value={prevMonth} />
            <button aria-label="Bulan sebelumnya" className="icon-button" type="submit">
              ‹
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
            <button aria-label="Bulan berikutnya" className="icon-button" type="submit">
              ›
            </button>
          </form>
        </div>
      </div>
      <strong className="monthly-expense-total">{formatIdr(totalExpense)}</strong>
      <div className="desktop-chart">
        <DailyExpenseChart points={monthPoints} />
      </div>
      <div className="mobile-chart">
        <DailyExpenseChart points={recentPoints} />
        {recentZero ? (
          <p className="monthly-expense-zero" role="status">
            Belum ada pengeluaran dalam 4 hari terakhir.
          </p>
        ) : null}
      </div>
      <p className="field-hint">
        Grafik menampilkan pengeluaran per hari dalam zona Asia/Jakarta.
      </p>
    </section>
  );
}
