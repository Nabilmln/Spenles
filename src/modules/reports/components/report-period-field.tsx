"use client";

import { useMemo, useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatRangeLong } from "@/lib/dates/format-id";

const OFFSET_MS = 7 * 60 * 60 * 1000;
const pad = (value: number) => String(value).padStart(2, "0");
const iso = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

function todayParts() {
  const shifted = new Date(Date.now() + OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function monthsBack(year: number, month: number, count: number) {
  const date = new Date(Date.UTC(year, month - 1 - count, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function options() {
  const today = todayParts();
  const last = monthsBack(today.year, today.month, 1);
  const lastThree = monthsBack(today.year, today.month, 2);
  const lastSix = monthsBack(today.year, today.month, 5);
  const lastDayOfPrevious = new Date(Date.UTC(today.year, today.month - 1, 0));
  return [
    {
      id: "this-month",
      label: "Bulan ini",
      from: iso(today.year, today.month, 1),
      to: iso(today.year, today.month, today.day),
    },
    {
      id: "last-month",
      label: "Bulan lalu",
      from: iso(last.year, last.month, 1),
      to: iso(
        lastDayOfPrevious.getUTCFullYear(),
        lastDayOfPrevious.getUTCMonth() + 1,
        lastDayOfPrevious.getUTCDate(),
      ),
    },
    {
      id: "last-3-months",
      label: "3 bulan terakhir",
      from: iso(lastThree.year, lastThree.month, 1),
      to: iso(today.year, today.month, today.day),
    },
    {
      id: "last-6-months",
      label: "6 bulan terakhir",
      from: iso(lastSix.year, lastSix.month, 1),
      to: iso(today.year, today.month, today.day),
    },
    {
      id: "this-year",
      label: "Tahun berjalan",
      from: iso(today.year, 1, 1),
      to: iso(today.year, today.month, today.day),
    },
  ];
}

export function ReportPeriodField({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const presetOptions = useMemo(() => options(), []);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  function submitValues(nextFrom: string, nextTo: string) {
    const form = document.getElementById(
      "report-analysis-form",
    ) as HTMLFormElement | null;
    if (!form) return;
    const set = (name: string, value: string) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      if (input) input.value = value;
    };
    set("from", nextFrom);
    set("to", nextTo);
    form.requestSubmit();
  }

  const label = formatRangeLong(from, to);

  return (
    <div className="relative">
      <input name="from" type="hidden" value={customFrom} />
      <input name="to" type="hidden" value={customTo} />
      <details className="relative">
        <summary
          aria-label="Pilih rentang tanggal"
          className="flex min-h-[2.9rem] cursor-pointer list-none items-center justify-between gap-2 rounded-[.72rem] border border-border bg-surface-subtle p-[.72rem_.85rem] font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden"
        >
          <CalendarRange aria-hidden="true" size={18} />
          <span className="truncate text-[.85rem]">{label}</span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={18} />
        </summary>
        <div className="absolute left-1/2 top-[calc(100%+.45rem)] z-15 grid w-max min-w-full max-w-[calc(100vw-1.5rem)] -translate-x-1/2 gap-[.3rem] rounded-[.8rem] border border-border bg-surface p-2 shadow-card">
          {presetOptions.map((option) => (
            <button
              key={option.id}
              className="min-h-[2.6rem] cursor-pointer rounded-[.55rem] border-0 bg-transparent p-[.5rem_.65rem] text-left text-[.85rem] text-foreground [overflow-wrap:anywhere] hover:bg-surface-subtle focus-visible:bg-surface-subtle"
              onClick={() => {
                setCustomFrom(option.from);
                setCustomTo(option.to);
                submitValues(option.from, option.to);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2 border-t border-border p-[.6rem_.35rem_.2rem]">
            <input
              aria-label="Tanggal awal"
              className={inputClass}
              onChange={(event) => setCustomFrom(event.target.value)}
              type="date"
              value={customFrom}
            />
            <input
              aria-label="Tanggal akhir"
              className={inputClass}
              onChange={(event) => setCustomTo(event.target.value)}
              type="date"
              value={customTo}
            />
            <button
              className={cn(buttonClass("secondary"), "col-span-full")}
              onClick={() => submitValues(customFrom, customTo)}
              type="button"
            >
              Terapkan rentang
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
