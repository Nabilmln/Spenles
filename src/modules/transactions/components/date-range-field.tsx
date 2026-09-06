"use client";

import { useState } from "react";
import { CalendarRange, ChevronRight } from "lucide-react";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { formatRangeLong } from "@/lib/dates/format-id";
import { inputClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export function DateRangeField({
  month,
  from,
  to,
}: {
  month?: string;
  from?: string;
  to?: string;
}) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");

  const label = customFrom && customTo
    ? formatRangeLong(customFrom, customTo)
    : "All periods";

  function submitValues(nextFrom: string, nextTo: string) {
    const form = document.getElementById(
      "transaction-filters-form",
    ) as HTMLFormElement | null;
    if (!form) return;
    const set = (name: string, value: string) => {
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      if (input) input.value = value;
    };
    set("month", "");
    set("from", nextFrom);
    set("to", nextTo);
  }

  function apply(nextFrom: string, nextTo: string) {
    setCustomFrom(nextFrom);
    setCustomTo(nextTo);
    submitValues(nextFrom, nextTo);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input name="month" type="hidden" value={month ?? ""} />
      <input name="from" type="hidden" value={customFrom} />
      <input name="to" type="hidden" value={customTo} />
      <button
        aria-label="Select date range"
        className={cn(
          inputClass,
          "flex min-h-[2.9rem] items-center justify-between gap-[.5rem] rounded-[.72rem] bg-white! p-[.72rem_.85rem] dark:bg-surface!",
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-[.5rem]">
          <CalendarRange aria-hidden="true" className="shrink-0 text-muted" size={18} />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[.85rem]">
            {label}
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Select Date Range"
        ariaLabel="Select date range"
        zIndex="z-[85]"
      >
        <div className="max-h-[62vh] overflow-y-auto pr-1">
          <CalendarRangeSelector
            from={customFrom}
            maxDays={366}
            onApply={apply}
            onCancel={() => setOpen(false)}
            to={customTo}
          />
        </div>
      </BottomSheet>
    </div>
  );
}