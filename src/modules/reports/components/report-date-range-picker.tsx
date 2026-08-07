"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  buildMonthGrid,
  formatReportDay,
  formatReportMonthYear,
  inclusiveDayCount,
  monthShift,
  todayJakartaDate,
} from "../lib/report-date";

const WEEK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function ReportDateRangePicker({
  currentFrom,
  currentTo,
  onApply,
  onCancel,
}: {
  currentFrom: string;
  currentTo: string;
  onApply: (from: string, to: string) => void;
  onCancel: () => void;
}) {
  const today = todayJakartaDate();
  const initial = useMemo(
    () => ({
      from: currentFrom && !(currentFrom > today) ? currentFrom : today,
      to: currentTo && !(currentTo > today) ? currentTo : today,
    }),
    [currentFrom, currentTo, today],
  );
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState(() => {
    const anchor = initial.to > today ? today : initial.to;
    return { year: Number(anchor.slice(0, 4)), month: Number(anchor.slice(5, 7)) };
  });
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const grid = buildMonthGrid(view.year, view.month);

  function handleDayClick(date: string) {
    if (date > today || error) {
      if (date > today) return;
    }
    if (!dragging || from === "" || to !== "") {
      setFrom(date);
      setTo("");
      setDragging(true);
    } else {
      if (date >= from) {
        setTo(date);
      } else {
        setTo(from);
        setFrom(date);
      }
      setDragging(false);
    }
  }

  function clearRange() {
    setFrom("");
    setTo("");
    setDragging(false);
    setError("");
  }

  function apply() {
    if (!from || !to) {
      setError("Pilih tanggal mulai dan tanggal akhir.");
      return;
    }
    if (from > to) {
      setError("Tanggal akhir harus setelah tanggal mulai.");
      return;
    }
    if (inclusiveDayCount(from, to) > 366) {
      setError("Rentang maksimal 366 hari.");
      return;
    }
    onApply(from, to);
  }

  const hasRange = Boolean(from && to);

  return (
    <div className="report-sheet">
      <div className="report-sheet-header">
        <h2 id="report-range-title">Pilih rentang tanggal</h2>
        <button
          aria-label="Tutup pilihan rentang"
          className="icon-button"
          onClick={onCancel}
          ref={closeRef}
          type="button"
        >
          <X aria-hidden="true" size={19} />
        </button>
      </div>

      <div className="report-calendar-nav" role="group" aria-label="Navigasi bulan">
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
          {formatReportMonthYear(view.year, view.month)}
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

      <div className="report-calendar-weekdays" aria-hidden="true">
        {WEEK_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="report-calendar-grid" role="grid" aria-label="Kalender bulan">
        {grid.map((cell, index) => {
          if (!cell) {
            return <span className="report-calendar-blank" aria-hidden="true" key={`blank-${index}`} />;
          }
          const isFuture = cell.date > today;
          const isStart = cell.date === from;
          const isEnd = cell.date === to;
          const isInRange = hasRange && cell.date >= from! && cell.date <= to!;
          const isToday = cell.date === today;
          const hyphen = from && to && from !== to;
          const className = [
            "report-calendar-day",
            isToday ? "report-calendar-today" : "",
            isStart ? "report-calendar-start" : "",
            isEnd ? "report-calendar-end" : "",
            isInRange ? "report-calendar-range" : "",
            isFuture ? "report-calendar-future" : "",
            hyphen && (isStart || isEnd) ? "report-calendar-drag" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              aria-label={formatReportDay(cell.date, true)}
              aria-pressed={isStart || isEnd}
              className={className}
              disabled={isFuture}
              key={cell.date}
              onClick={() => handleDayClick(cell.date)}
              style={
                isStart && hasRange && from !== to || isEnd && hasRange && from !== to
                  ? { zIndex: 2 }
                  : undefined
              }
              type="button"
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="report-selection-summary" aria-live="polite">
        {hasRange ? (
          <span>
            <strong>{formatReportDay(from, true)}</strong> –{" "}
            <strong>{formatReportDay(to, true)}</strong>
            <span className="muted">
              {" "}
              ({inclusiveDayCount(from, to)} hari)
            </span>
          </span>
        ) : (
          <span className="muted">
            {from ? "Pilih tanggal akhir." : "Pilih tanggal mulai lalu tanggal akhir."}
          </span>
        )}
      </div>

      {error ? (
        <p className="form-message" role="alert">{error}</p>
      ) : null}

      <div className="report-sheet-actions">
        <button
          aria-label="Reset rentang"
          className="button button-secondary"
          onClick={clearRange}
          type="button"
        >
          Reset
        </button>
        <button
          className="button button-secondary"
          onClick={onCancel}
          type="button"
        >
          Batal
        </button>
        <button
          className="button button-primary"
          onClick={apply}
          type="button"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}