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
    <div className="date-range-field">
      <details
        className="date-range-popover"
        onToggle={(event) => setOpen(event.currentTarget.open)}
        open={open}
      >
        <summary aria-label="Pilih bulan tagihan" className="date-range-trigger">
          <CalendarRange aria-hidden="true" size={18} />
          <span>{label}</span>
          <ChevronDown aria-hidden="true" className="date-range-chevron" size={18} />
        </summary>
        <div className="date-range-menu">
          <div className="calendar-selector">
            <div className="calendar-nav" role="group" aria-label="Navigasi bulan">
              <button
                aria-label="Bulan sebelumnya"
                className="icon-button"
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
                className="icon-button"
                onClick={() =>
                  setView((current) => monthShift(current.year, current.month, 1))
                }
                type="button"
              >
                <ChevronRight aria-hidden="true" size={20} />
              </button>
            </div>

            <div className="calendar-weekdays" aria-hidden="true">
              {WEEK_DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid" role="grid" aria-label="Kalender bulan">
              {grid.map((cell, index) => {
                if (!cell) {
                  return (
                    <span
                      aria-hidden="true"
                      className="calendar-blank"
                      key={`blank-${index}`}
                    />
                  );
                }
                const selected = cell.date.slice(0, 7) === month;
                const isToday = cell.date === today;
                const className = [
                  "calendar-day",
                  isToday ? "calendar-today" : "",
                  selected ? "calendar-end" : "",
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

            <div className="calendar-summary" aria-live="polite">
              <span className="muted">
                Klik salah satu tanggal untuk memilih bulannya.
              </span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
