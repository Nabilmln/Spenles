"use client";

import { useState } from "react";
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  buildMonthGrid,
  monthShift,
  todayJakartaDate,
} from "@/lib/dates/calendar";
import { formatDateLong, formatMonthYearLabel } from "@/lib/dates/format-id";
import { iconButtonClass } from "./styles";

const WEEK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function MonthSelector({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  const today = todayJakartaDate();
  const [view, setView] = useState(() => {
    if (month) {
      return { year: Number(month.slice(0, 4)), month: Number(month.slice(5, 7)) };
    }
    return { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
  });
  const [open, setOpen] = useState(false);

  const label = month
    ? formatMonthYearLabel(Number(month.slice(0, 4)), Number(month.slice(5, 7)))
    : "Semua bulan";

  const grid = buildMonthGrid(view.year, view.month);

  function selectDay(date: string) {
    setOpen(false);
    onChange(date.slice(0, 7));
  }

  return (
    <div className="relative">
      <details
        className="relative"
        onToggle={(event) => setOpen(event.currentTarget.open)}
        open={open}
      >
        <summary aria-label="Pilih bulan tagihan" className="flex min-h-[2.9rem] cursor-pointer list-none items-center justify-between gap-[.5rem] rounded-[.72rem] border border-border bg-surface-subtle px-[.85rem] py-[.72rem] font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <CalendarRange aria-hidden="true" size={18} />
          <span className="min-w-0 flex-1 truncate text-[.85rem]">{label}</span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={18} />
        </summary>
        <div className="absolute left-1/2 top-[calc(100%+.45rem)] z-[15] grid w-max min-w-full max-w-[calc(100vw-1.5rem)] gap-[.3rem] -translate-x-1/2 rounded-[.8rem] border border-border bg-surface p-[.5rem] shadow-card">
          <div className="min-w-[19rem]">
            <div className="mb-[.65rem] flex items-center justify-between gap-[.5rem]" role="group" aria-label="Navigasi bulan">
              <button
                aria-label="Bulan sebelumnya"
                className={`${iconButtonClass} size-10`}
                onClick={() =>
                  setView((current) => monthShift(current.year, current.month, -1))
                }
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={20} />
              </button>
              <strong aria-live="polite">
                {formatMonthYearLabel(view.year, view.month)}
              </strong>
              <button
                aria-label="Bulan berikutnya"
                className={`${iconButtonClass} size-10`}
                onClick={() =>
                  setView((current) => monthShift(current.year, current.month, 1))
                }
                type="button"
              >
                <ChevronRight aria-hidden="true" size={20} />
              </button>
            </div>

            <div className="mb-[.35rem] grid grid-cols-7 gap-1" aria-hidden="true">
              {WEEK_DAYS.map((day) => (
                <span className="text-center text-[.72rem] font-medium text-muted" key={day}>{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Kalender bulan">
              {grid.map((cell, index) => {
                if (!cell) {
                  return (
                    <span
                      aria-hidden="true"
                      className="grid min-h-[2.5rem] place-items-center rounded-[.6rem] text-[.88rem]"
                      key={`blank-${index}`}
                    />
                  );
                }
                const selected = cell.date.slice(0, 7) === month;
                const isToday = cell.date === today;
                const className = [
                  "grid min-h-[2.5rem] cursor-pointer place-items-center rounded-[.6rem] border border-transparent bg-surface-subtle text-[.88rem] text-foreground hover:enabled:bg-primary-50",
                  isToday ? "border-primary-600 font-medium" : "",
                  selected ? "relative z-[1] rounded-[.6rem] bg-primary-600 font-medium text-white" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    aria-label={formatDateLong(cell.date)}
                    aria-pressed={selected}
                    className={className}
                    key={cell.date}
                    onClick={() => selectDay(cell.date)}
                    type="button"
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-[.9rem] min-h-[1.4rem] text-[.88rem]" aria-live="polite">
              <span className="text-muted">
                Klik salah satu tanggal untuk memilih bulannya.
              </span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
