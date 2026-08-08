"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonthGrid,
  inclusiveDayCount,
  monthShift,
  todayJakartaDate,
} from "@/lib/dates/calendar";
import { formatDateLong, formatMonthYearLabel } from "@/lib/dates/format-id";

const WEEK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function CalendarRangeSelector({
  from,
  to,
  onChange,
  onApply,
  onCancel,
  maxDays = 366,
}: {
  from: string;
  to: string;
  onChange?: (from: string, to: string) => void;
  onApply?: (from: string, to: string) => void;
  onCancel?: () => void;
  maxDays?: number;
}) {
  const today = todayJakartaDate();
  const [pendingFrom, setPendingFrom] = useState(from);
  const [pendingTo, setPendingTo] = useState(to);
  const [error, setError] = useState("");
  const [view, setView] = useState(() => {
    const anchor = to || from || today;
    return {
      year: Number(anchor.slice(0, 4)),
      month: Number(anchor.slice(5, 7)),
    };
  });
  const [prevProps, setPrevProps] = useState({ from, to });

  if (prevProps.from !== from || prevProps.to !== to) {
    setPrevProps({ from, to });
    setPendingFrom(from);
    setPendingTo(to);
    setError("");
  }

  const grid = buildMonthGrid(view.year, view.month);
  const hasRange = Boolean(pendingFrom && pendingTo);

  function handleDayClick(date: string) {
    if (date > today) return;
    if (!pendingFrom || pendingTo !== "") {
      setPendingFrom(date);
      setPendingTo("");
      setError("");
      return;
    }
    const nextFrom = date >= pendingFrom ? pendingFrom : date;
    const nextTo = date >= pendingFrom ? date : pendingFrom;
    if (inclusiveDayCount(nextFrom, nextTo) > maxDays) {
      setError(`Rentang maksimal ${maxDays} hari.`);
      return;
    }
    setPendingFrom(nextFrom);
    setPendingTo(nextTo);
    setError("");
    onChange?.(nextFrom, nextTo);
  }

  function reset() {
    setPendingFrom("");
    setPendingTo("");
    setError("");
    onChange?.("", "");
  }

  function apply() {
    if (!pendingFrom || !pendingTo) {
      setError("Pilih tanggal mulai dan tanggal akhir.");
      return;
    }
    if (inclusiveDayCount(pendingFrom, pendingTo) > maxDays) {
      setError(`Rentang maksimal ${maxDays} hari.`);
      return;
    }
    onApply?.(pendingFrom, pendingTo);
  }

  return (
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
          const isFuture = cell.date > today;
          const isStart = cell.date === pendingFrom;
          const isEnd = cell.date === pendingTo;
          const isInRange =
            hasRange && cell.date >= pendingFrom! && cell.date <= pendingTo!;
          const isToday = cell.date === today;
          const hyphen = pendingFrom && pendingTo && pendingFrom !== pendingTo;
          const className = [
            "calendar-day",
            isToday ? "calendar-today" : "",
            isStart ? "calendar-start" : "",
            isEnd ? "calendar-end" : "",
            isInRange ? "calendar-range" : "",
            isFuture ? "calendar-future" : "",
            hyphen && (isStart || isEnd) ? "calendar-drag" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              aria-label={formatDateLong(cell.date)}
              aria-pressed={isStart || isEnd}
              className={className}
              disabled={isFuture}
              key={cell.date}
              onClick={() => handleDayClick(cell.date)}
              style={
                (isStart && hasRange && pendingFrom !== pendingTo) ||
                (isEnd && hasRange && pendingFrom !== pendingTo)
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

      <div className="calendar-summary" aria-live="polite">
        {hasRange ? (
          <span>
            <strong>{formatDateLong(pendingFrom)}</strong> –{" "}
            <strong>{formatDateLong(pendingTo)}</strong>
            <span className="muted">
              {" "}
              ({inclusiveDayCount(pendingFrom, pendingTo)} hari)
            </span>
          </span>
        ) : (
          <span className="muted">
            {pendingFrom
              ? "Pilih tanggal akhir."
              : "Pilih tanggal mulai lalu tanggal akhir."}
          </span>
        )}
      </div>

      {error ? (
        <p className="form-message" role="alert">
          {error}
        </p>
      ) : null}

      {onApply ? (
        <div className="calendar-actions">
          <button
            aria-label="Reset rentang"
            className="button button-secondary"
            onClick={reset}
            type="button"
          >
            Reset
          </button>
          {onCancel ? (
            <button
              className="button button-secondary"
              onClick={onCancel}
              type="button"
            >
              Batal
            </button>
          ) : null}
          <button className="button button-primary" onClick={apply} type="button">
            Terapkan
          </button>
        </div>
      ) : null}
    </div>
  );
}
