"use client";

import { useState } from "react";
import { CalendarRange, ChevronDown, Download, FileText } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { buttonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatReportRange, formatReportRangeShort } from "../lib/report-date";

type Sheet = "none" | "range" | "export";

const triggerClass =
  "cursor-pointer rounded-[.78rem] border border-border bg-surface font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(79_70_229/12%)] focus:outline-none";

export function ReportToolbar({
  from,
  to,
  pdfHref,
  pdfPreviewHref,
}: {
  from: string;
  to: string;
  pdfHref: string;
  pdfPreviewHref: string;
}) {
  const [sheet, setSheet] = useState<Sheet>("none");
  const rangeLabel = formatReportRange(from, to);
  const rangeLabelShort = formatReportRangeShort(from, to);

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
            <span className="text-[.66rem] font-semibold uppercase tracking-[.06em] text-muted">
              Select date
            </span>
            <span className="leading-snug text-[.84rem] font-semibold [overflow-wrap:anywhere]">
              {rangeLabelShort}
            </span>
          </span>
          <ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={16} />
        </button>
        <button
          aria-haspopup="dialog"
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

      <BottomSheet
        open={sheet === "range"}
        onClose={() => setSheet("none")}
        title="Select date range"
        ariaLabel="Select date range"
      >
        <CalendarRangeSelector
          from={from}
          to={to}
          maxDays={366}
          onApply={applyRange}
          onCancel={() => setSheet("none")}
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "export"}
        onClose={() => setSheet("none")}
        title="Export report"
        ariaLabel="Export report"
        zIndex="z-[85]"
        footer={
          <a
            className={cn(buttonClass("primary"), "w-full")}
            download
            href={pdfHref}
          >
            <Download aria-hidden="true" size={18} />
            Download PDF
          </a>
        }
      >
        <p className="m-0 mb-4 text-muted">
          Preview the {rangeLabel} report below before downloading.
        </p>
        <iframe
          className="h-[min(52dvh,26rem)] w-full rounded-[.7rem] border border-border bg-surface-subtle"
          src={pdfPreviewHref}
          title="Report preview"
        />
        <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-3 text-[.76rem] text-muted">
          Your data stays private. PDF supports up to 366 days and max. 500
          detail transactions.
        </p>
      </BottomSheet>
    </div>
  );
}