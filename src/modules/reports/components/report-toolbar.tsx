"use client";

import { useRef, useState } from "react";
import { CalendarRange, ChevronDown, FileSpreadsheet, FileText, X } from "lucide-react";
import { buttonClass, iconButtonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatReportRange } from "../lib/report-date";
import { ReportDateRangePicker } from "./report-date-range-picker";

type Sheet = "none" | "range" | "export";

const triggerClass =
  "cursor-pointer rounded-[.78rem] border border-border bg-surface font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(79_70_229/12%)] focus:outline-none";

export function ReportToolbar({
  from,
  to,
  pdfHref,
  csvHref,
}: {
  from: string;
  to: string;
  pdfHref: string;
  csvHref: string;
}) {
  const [sheet, setSheet] = useState<Sheet>("none");
  const exportCloseRef = useRef<HTMLButtonElement>(null);
  const rangeLabel = formatReportRange(from, to);

  function applyRange(nextFrom: string, nextTo: string) {
    setSheet("none");
    const url = new URL(window.location.href);
    url.searchParams.set("from", nextFrom);
    url.searchParams.set("to", nextTo);
    window.location.href = url.toString();
  }

  return (
    <div>
      <div className="flex gap-[.6rem]">
        <button
          aria-label={`Select date range: ${rangeLabel}`}
          className={cn(
            triggerClass,
            "flex min-h-[3.05rem] flex-[1_1_auto] items-center gap-[.6rem] p-[.5rem_1rem] text-left",
          )}
          onClick={() => setSheet("range")}
          type="button"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[.65rem] bg-primary-50 text-primary-600">
            <CalendarRange aria-hidden="true" size={18} />
          </span>
          <span className="grid min-w-0 flex-1 gap-[.05rem]">
            <span className="truncate text-[.66rem] font-semibold uppercase tracking-[.06em] text-muted">
              Select date
            </span>
            <span className="truncate text-[.84rem] font-semibold">{rangeLabel}</span>
          </span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={16} />
        </button>
        <button
          aria-haspopup="menu"
          aria-label="Export report"
          className={cn(
            triggerClass,
            "flex min-h-[3.05rem] shrink-0 items-center gap-[.6rem] p-[.5rem_.85rem]",
          )}
          onClick={() => setSheet("export")}
          type="button"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[.65rem] bg-primary-50 text-primary-600">
            <FileText aria-hidden="true" size={18} />
          </span>
          <span className="grid text-left gap-[.05rem]">
            <span className="truncate text-[.66rem] font-semibold uppercase tracking-[.06em] text-muted">
              Export
            </span>
            <span className="truncate text-[.84rem] font-semibold">Report</span>
          </span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={16} />
        </button>
      </div>

      {sheet === "range" ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-[rgb(15_17_21/55%)] p-4" onClick={() => setSheet("none")}>
          <div
            aria-labelledby="report-range-title"
            aria-modal="true"
            className="w-full max-w-[30rem] max-h-[86vh] overflow-y-auto border border-border bg-surface p-[1.25rem] rounded-[1.1rem] shadow-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <ReportDateRangePicker
              currentFrom={from}
              currentTo={to}
              onApply={applyRange}
              onCancel={() => setSheet("none")}
            />
          </div>
        </div>
      ) : null}

      {sheet === "export" ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-[rgb(15_17_21/55%)] p-4" onClick={() => setSheet("none")}>
          <div
            aria-labelledby="report-export-title"
            aria-modal="true"
            className="w-full max-w-[30rem] max-h-[86vh] overflow-y-auto border border-border bg-surface p-[1.25rem] rounded-[1.1rem] shadow-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-[.75rem]">
              <h2 id="report-export-title" className="m-0 text-[1.08rem]">Export report</h2>
              <button
                aria-label="Close export menu"
                className={iconButtonClass}
                onClick={() => setSheet("none")}
                ref={exportCloseRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <p className="m-0 mb-4 text-muted">
              The {rangeLabel} range will be used for the export.
            </p>
            <div className="grid gap-[.65rem]">
              <a className={cn(buttonClass("secondary"), "w-full justify-start")} href={pdfHref}>
                <FileText aria-hidden="true" className="shrink-0" size={18} />
                Export PDF
              </a>
              <a className={cn(buttonClass("secondary"), "w-full justify-start")} href={csvHref}>
                <FileSpreadsheet aria-hidden="true" className="shrink-0" size={18} />
                Export CSV
              </a>
            </div>
            <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-3 text-[.76rem] text-muted">
              Your data stays private. PDF supports up to 366 days and max. 500
              detail transactions; CSV max. 10,000 transactions.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
