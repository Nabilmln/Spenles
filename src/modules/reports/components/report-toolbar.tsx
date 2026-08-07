"use client";

import { useRef, useState } from "react";
import { CalendarRange, FileSpreadsheet, FileText, X } from "lucide-react";
import { formatReportRange } from "../lib/report-date";
import { ReportDateRangePicker } from "./report-date-range-picker";

type Sheet = "none" | "range" | "export";

export function ReportToolbar({
  from,
  to,
  exportHref,
}: {
  from: string;
  to: string;
  exportHref: (kind: "pdf" | "csv") => string;
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
    <div className="report-toolbar-outer">
      <div className="report-toolbar">
        <button
          aria-label={`Pilih rentang tanggal: ${rangeLabel}`}
          className="report-range-button"
          onClick={() => setSheet("range")}
          type="button"
        >
          <CalendarRange aria-hidden="true" size={18} />
          <span>{rangeLabel}</span>
        </button>
        <button
          aria-haspopup="menu"
          aria-label="Ekspor laporan"
          className="report-export-button"
          onClick={() => setSheet("export")}
          type="button"
        >
          <FileText aria-hidden="true" size={18} />
          <span>Export</span>
        </button>
      </div>

      {sheet === "range" ? (
        <div className="report-sheet-backdrop" onClick={() => setSheet("none")}>
          <div className="report-sheet-panel report-sheet-calendar" role="dialog" aria-modal="true" aria-labelledby="report-range-title">
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
        <div className="report-sheet-backdrop" onClick={() => setSheet("none")}>
          <div className="report-sheet-panel report-export-sheet" role="dialog" aria-modal="true" aria-labelledby="report-export-title">
            <div className="report-sheet-header">
              <h2 id="report-export-title">Ekspor laporan</h2>
              <button
                aria-label="Tutup menu ekspor"
                className="icon-button"
                onClick={() => setSheet("none")}
                ref={exportCloseRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <p className="muted report-export-hint">
              Rentang {rangeLabel} akan dipakai untuk ekspor.
            </p>
            <div className="report-export-options">
              <a className="button button-secondary report-export-option" href={exportHref("pdf")}>
                <FileText aria-hidden="true" size={18} />
                Export PDF
              </a>
              <a className="button button-secondary report-export-option" href={exportHref("csv")}>
                <FileSpreadsheet aria-hidden="true" size={18} />
                Export CSV
              </a>
            </div>
            <p className="financial-disclaimer">
              Data tetap pribadi. PDF mendukung hingga 366 hari dan detail maks. 500
              transaksi; CSV maks. 10.000 transaksi.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}