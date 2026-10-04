"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { formatReportDateChip, formatReportRange } from "../lib/report-date";

export function ReportToolbar({ from, to }: { from: string; to: string }) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeLabel = formatReportRange(from, to);

  function applyRange(nextFrom: string, nextTo: string) {
    setRangeOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("from", nextFrom);
    url.searchParams.set("to", nextTo);
    window.location.href = url.toString();
  }

  return (
    <div>
      <button
        aria-label={`Select date range: ${rangeLabel}`}
        className="flex min-h-[4.5rem] w-full cursor-pointer items-center gap-2 rounded-[1.25rem] bg-primary-700 px-3 text-left text-white transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        onClick={() => setRangeOpen(true)}
        type="button"
      >
        <span className="grid w-9 shrink-0 justify-items-center gap-[.1rem]">
          <CalendarRange aria-hidden="true" size={22} />
          <span className="text-[.64rem] font-medium leading-none">Date</span>
        </span>
        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 whitespace-nowrap">
          <span className="min-w-0 rounded-[.5rem] bg-white px-1 py-[.8rem] text-center text-[.86rem] font-semibold leading-none text-foreground">
            {formatReportDateChip(from)}
          </span>
          <span className="text-[.86rem] font-medium text-white">-</span>
          <span className="min-w-0 rounded-[.5rem] bg-white px-1 py-[.8rem] text-center text-[.86rem] font-semibold leading-none text-foreground">
            {formatReportDateChip(to)}
          </span>
        </span>
      </button>

      <BottomSheet
        open={rangeOpen}
        onClose={() => setRangeOpen(false)}
        title="Select date range"
        ariaLabel="Select date range"
      >
        <CalendarRangeSelector
          from={from}
          to={to}
          maxDays={366}
          onApply={applyRange}
          onCancel={() => setRangeOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}
