"use client";

import { useMemo, useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";

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

function monthKey(year: number, month: number) {
  return `${year}-${pad(month)}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

const options = () => {
  const today = todayParts();
  const last = monthsBack(today.year, today.month, 1);
  const lastThree = monthsBack(today.year, today.month, 2);
  const lastSix = monthsBack(today.year, today.month, 5);
  return [
    {
      id: "this-month",
      label: "Bulan ini",
      month: monthKey(today.year, today.month),
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
    {
      id: "last-3-months",
      label: "3 bulan terakhir",
      month: "",
      from: iso(lastThree.year, lastThree.month, 1),
      to: iso(today.year, today.month, today.day),
    },
    {
      id: "last-6-months",
      label: "6 bulan terakhir",
      month: "",
      from: iso(lastSix.year, lastSix.month, 1),
      to: iso(today.year, today.month, today.day),
    },
    {
      id: "this-year",
      label: "Tahun berjalan",
      month: "",
      from: iso(today.year, 1, 1),
      to: iso(today.year, today.month, today.day),
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
      ? `${from} s.d. ${to}`
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
    <div className="date-range-field">
      <input name="month" type="hidden" value={selectedMonth} />
      <input name="from" type="hidden" value={customFrom} />
      <input name="to" type="hidden" value={customTo} />
      <details className="date-range-popover">
        <summary aria-label="Pilih rentang tanggal" className="date-range-trigger">
          <CalendarRange aria-hidden="true" size={18} />
          <span>{label}</span>
          <ChevronDown aria-hidden="true" className="date-range-chevron" size={18} />
        </summary>
        <div className="date-range-menu">
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
            >
              {option.label}
            </button>
          ))}
          <div className="date-range-custom">
            <input
              aria-label="Tanggal awal"
              className="input"
              onChange={(event) => setCustomFrom(event.target.value)}
              type="date"
              value={customFrom}
            />
            <input
              aria-label="Tanggal akhir"
              className="input"
              onChange={(event) => setCustomTo(event.target.value)}
              type="date"
              value={customTo}
            />
            <button
              className="button button-secondary"
              onClick={() => submitValues("", customFrom, customTo)}
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
