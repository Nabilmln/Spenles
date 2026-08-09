"use client";

import { useMemo, useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { monthShift, todayJakartaDate } from "@/lib/dates/calendar";
import { formatMonthYearLabel, formatRangeLong } from "@/lib/dates/format-id";

const pad = (value: number) => String(value).padStart(2, "0");

function monthKey(year: number, month: number) {
  return `${year}-${pad(month)}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return formatMonthYearLabel(year, month);
}

const options = () => {
  const today = todayJakartaDate();
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const last = monthShift(year, month, -1);
  return [
    {
      id: "this-month",
      label: "Bulan ini",
      month: monthKey(year, month),
      from: "",
      to: "",
    },
    {
      id: "last-month",
      label: "Bulan lalu",
      month: monthKey(last.year, last.month),
      from: "",
      to: "",
    },
  ];
};

export function DateRangeField({
  month,
  from,
  to,
}: {
  month?: string;
  from?: string;
  to?: string;
}) {
  const presetOptions = useMemo(() => options(), []);
  const hasMonth = Boolean(month && !from && !to);
  const hasRange = Boolean(from && to);
  const [selectedMonth, setSelectedMonth] = useState(month ?? "");
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");

  const label = hasMonth
    ? monthLabel(month!)
    : hasRange
      ? formatRangeLong(from!, to!)
      : "Semua periode";

  function submitValues(nextMonth: string, nextFrom: string, nextTo: string) {
    const form = document.getElementById(
      "transaction-filters-form",
    ) as HTMLFormElement | null;
    if (!form) return;
    const set = (name: string, value: string) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      if (input) input.value = value;
    };
    set("month", nextMonth);
    set("from", nextFrom);
    set("to", nextTo);
    form.requestSubmit();
  }

  return (
    <div className="relative">
      <input name="month" type="hidden" value={selectedMonth} />
      <input name="from" type="hidden" value={customFrom} />
      <input name="to" type="hidden" value={customTo} />
      <details className="relative">
        <summary aria-label="Pilih rentang tanggal" className="flex min-h-[2.9rem] items-center justify-between gap-[.5rem] rounded-[.72rem] border border-border bg-surface-subtle p-[.72rem_.85rem] font-medium text-foreground cursor-pointer list-none marker:hidden [&::-webkit-details-marker]:hidden">
          <CalendarRange aria-hidden="true" size={18} />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[.85rem]">{label}</span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={18} />
        </summary>
        <div className="absolute left-1/2 top-[calc(100%+.45rem)] z-[15] grid w-max min-w-full max-w-[calc(100vw-1.5rem)] -translate-x-1/2 gap-[.3rem] rounded-[.8rem] border border-border bg-surface p-[.5rem] shadow-card">
          {presetOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedMonth(option.month);
                setCustomFrom(option.from);
                setCustomTo(option.to);
                submitValues(option.month, option.from, option.to);
              }}
              type="button"
              className="min-h-[2.6rem] cursor-pointer wrap-anywhere rounded-[.55rem] border-0 bg-transparent p-[.5rem_.65rem] text-left text-[.85rem] text-foreground hover:bg-surface-subtle focus-visible:bg-surface-subtle"
            >
              {option.label}
            </button>
          ))}
          <div className="border-t border-border p-[.65rem_.35rem_.2rem]">
            <span className="px-[.35rem] pb-[.1rem] text-[.72rem] font-medium uppercase tracking-[.04em] text-muted">Rentang kustom</span>
            <CalendarRangeSelector
              from={customFrom}
              maxDays={366}
              onChange={(nextFrom, nextTo) => {
                setCustomFrom(nextFrom);
                setCustomTo(nextTo);
                submitValues("", nextFrom, nextTo);
              }}
              to={customTo}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
