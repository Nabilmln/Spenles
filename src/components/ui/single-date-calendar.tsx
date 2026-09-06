"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonthGrid,
  monthShift,
  todayJakartaDate,
} from "@/lib/dates/calendar";
import { formatDateLong, formatMonthYearLabel } from "@/lib/dates/format-id";
import { iconButtonClass } from "./styles";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SingleDateCalendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const today = todayJakartaDate();
  const [view, setView] = useState(() => {
    const anchor = value || today;
    return {
      year: Number(anchor.slice(0, 4)),
      month: Number(anchor.slice(5, 7)),
    };
  });
  const [prevValue, setPrevValue] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);
  }

  const grid = buildMonthGrid(view.year, view.month);

  return (
    <div className="min-w-[19rem]">
      <div
        className="mb-[.65rem] flex items-center justify-between gap-[.5rem]"
        role="group"
        aria-label="Month navigation"
      >
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
          <span
            className="text-center text-[.72rem] font-medium text-muted"
            key={day}
          >
            {day}
          </span>
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
          const selected = cell.date === value;
          return (
            <button
              aria-label={formatDateLong(cell.date)}
              aria-pressed={selected}
              className={cn(
                "grid min-h-[2.5rem] place-items-center text-[.88rem] cursor-pointer border border-transparent hover:enabled:bg-primary-50 disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50",
                selected
                  ? "rounded-[.6rem] bg-primary-600 font-medium text-white"
                  : "bg-surface-subtle text-foreground",
              )}
              disabled={isFuture}
              key={cell.date}
              onClick={() => onChange(cell.date)}
              type="button"
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}