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
import { buttonClass, formMessageClass, iconButtonClass } from "./styles";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      setError(`Maximum range is ${maxDays} days.`);
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
      setError("Select a start and end date.");
      return;
    }
    if (inclusiveDayCount(pendingFrom, pendingTo) > maxDays) {
      setError(`Maximum range is ${maxDays} days.`);
      return;
    }
    onApply?.(pendingFrom, pendingTo);
  }

  return (
    <div className="min-w-[19rem]">
      <div className="mb-[.65rem] flex items-center justify-between gap-[.5rem]" role="group" aria-label="Month navigation">
        <button
          aria-label="Previous month"
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
          aria-label="Next month"
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

      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Month calendar">
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
          const isFuture = cell.date > today;
          const isStart = cell.date === pendingFrom;
          const isEnd = cell.date === pendingTo;
          const isInRange =
            hasRange && cell.date >= pendingFrom! && cell.date <= pendingTo!;
          const isToday = cell.date === today;
          const className = [
            "grid min-h-[2.5rem] place-items-center text-[.88rem] cursor-pointer border border-transparent bg-surface-subtle text-foreground hover:enabled:bg-primary-50 disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50",
            isToday ? "border-primary-600 font-medium" : "",
            isStart ? "relative z-[1] rounded-l-[.6rem] bg-primary-600 font-medium text-white" : "",
            isEnd ? "relative z-[1] rounded-r-[.6rem] bg-primary-600 font-medium text-white" : "",
            isInRange && !isStart && !isEnd ? "rounded-none bg-primary-50" : "",
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

      <div className="mt-[.9rem] min-h-[1.4rem] text-[.88rem] text-foreground" aria-live="polite">
        {hasRange ? (
          <span>
            <strong>{formatDateLong(pendingFrom)}</strong> –{" "}
            <strong>{formatDateLong(pendingTo)}</strong>
            <span className="text-muted">
              {" "}
              ({inclusiveDayCount(pendingFrom, pendingTo)} days)
            </span>
          </span>
        ) : (
          <span className="text-muted">
            {pendingFrom
              ? "Select an end date."
              : "Select a start date, then an end date."}
          </span>
        )}
      </div>

      {error ? (
        <p className={formMessageClass} role="alert">
          {error}
        </p>
      ) : null}

      {onApply ? (
        <div className="mt-[1.1rem] flex justify-end gap-[.6rem]">
          <button
            aria-label="Reset range"
            className={`${buttonClass("secondary")} max-[720px]:flex-1 max-[720px]:justify-center`}
            onClick={reset}
            type="button"
          >
            Reset
          </button>
          {onCancel ? (
            <button
              className={`${buttonClass("secondary")} max-[720px]:flex-1 max-[720px]:justify-center`}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          ) : null}
          <button
            className={`${buttonClass("primary")} max-[720px]:flex-1 max-[720px]:justify-center`}
            onClick={apply}
            type="button"
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
