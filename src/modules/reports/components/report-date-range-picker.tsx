"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
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
