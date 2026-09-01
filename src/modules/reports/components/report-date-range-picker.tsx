"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { iconButtonClass } from "@/components/ui/styles";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";

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
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-[.75rem]">
        <h2 id="report-range-title" className="m-0 text-[1.08rem]">Select date range</h2>
        <button
          aria-label="Close range picker"
          className={iconButtonClass}
          onClick={onCancel}
          ref={closeRef}
          type="button"
        >
          <X aria-hidden="true" size={19} />
        </button>
      </div>

      <CalendarRangeSelector
        from={currentFrom}
        to={currentTo}
        maxDays={366}
        onApply={onApply}
        onCancel={onCancel}
      />
    </div>
  );
}
