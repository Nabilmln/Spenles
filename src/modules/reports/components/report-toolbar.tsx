"use client";

import { useRef, useState } from "react";
import { CalendarRange, FileSpreadsheet, FileText, X } from "lucide-react";
import { buttonClass, iconButtonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatReportRange } from "../lib/report-date";
import { ReportDateRangePicker } from "./report-date-range-picker";

type Sheet = "none" | "range" | "export";

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
          aria-label={`Pilih rentang tanggal: ${rangeLabel}`}
          className="inline-flex min-h-[2.85rem] flex-[1_1_auto] cursor-pointer items-center justify-center gap-[.5rem] rounded-[.72rem] border border-border bg-surface p-[.65rem_1rem] font-medium text-foreground"
          onClick={() => setSheet("range")}
          type="button"
        >
          <CalendarRange aria-hidden="true" className="shrink-0 text-primary-600" size={18} />
          <span className="text-[.85rem]">{rangeLabel}</span>
        </button>
        <button
          aria-haspopup="menu"
          aria-label="Ekspor laporan"
          className="inline-flex min-h-[2.85rem] shrink-0 cursor-pointer items-center justify-center gap-[.5rem] rounded-[.72rem] border border-border bg-surface p-[.65rem_1rem] font-medium text-foreground"
          onClick={() => setSheet("export")}
          type="button"
        >
          <FileText aria-hidden="true" className="shrink-0 text-primary-600" size={18} />
          <span>Export</span>
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
              <h2 id="report-export-title" className="m-0 text-[1.08rem]">Ekspor laporan</h2>
              <button
                aria-label="Tutup menu ekspor"
                className={iconButtonClass}
                onClick={() => setSheet("none")}
                ref={exportCloseRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <p className="m-0 mb-4 text-muted">
              Rentang {rangeLabel} akan dipakai untuk ekspor.
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
              Data tetap pribadi. PDF mendukung hingga 366 hari dan detail maks. 500
              transaksi; CSV maks. 10.000 transaksi.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
