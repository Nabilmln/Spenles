"use client";

import { useState } from "react";
import { CalendarRange, ChevronDown, Send, Upload } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { buttonClass, fieldClass, fieldLabelClass, inputClass } from "@/components/ui/styles";
import { useToastActionState } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { emailReportAction, type EmailReportState } from "../actions/email-report";
import { formatReportRange, formatReportRangeShort } from "../lib/report-date";

type Sheet = "none" | "range" | "export" | "export-range";

const triggerClass =
  "cursor-pointer rounded-[.78rem] border border-border bg-surface font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(23_23_23/12%)] focus:outline-none";

export function ReportToolbar({
  from,
  to,
  email,
  accounts,
}: {
  from: string;
  to: string;
  email: string;
  accounts: { id: string; name: string }[];
}) {
  const [sheet, setSheet] = useState<Sheet>("none");
  const [recipient, setRecipient] = useState(email);
  const [accountId, setAccountId] = useState("");
  const [exportFrom, setExportFrom] = useState(from);
  const [exportTo, setExportTo] = useState(to);
  const [, sendAction, sending] = useToastActionState<EmailReportState, FormData>(
    emailReportAction,
    {},
    undefined,
    () => setSheet("none"),
  );
  const rangeLabel = formatReportRange(from, to);
  const rangeLabelShort = formatReportRangeShort(from, to);
  const exportRangeLabel = formatReportRangeShort(exportFrom, exportTo);

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
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
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
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600">
            <Upload aria-hidden="true" size={18} />
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
          <button className={cn(buttonClass("primary"), "w-full")} disabled={sending || accounts.length === 0} form="email-report-form" type="submit">
            <Send aria-hidden="true" size={18} />
            {sending ? "Preparing report..." : "Email report"}
          </button>
        }
      >
        <form action={sendAction} className="grid gap-5" id="email-report-form">
          <div className={fieldClass}>
            <label className={fieldLabelClass} htmlFor="report-recipient">Send to</label>
            <input
              autoComplete="email"
              className={inputClass}
              id="report-recipient"
              name="email"
              onChange={(event) => setRecipient(event.target.value)}
              required
              type="email"
              value={recipient}
            />
          </div>
          <div className={fieldClass}>
            <label className={fieldLabelClass} htmlFor="report-account">Source account</label>
            <select
              className={inputClass}
              id="report-account"
              name="accountId"
              onChange={(event) => setAccountId(event.target.value)}
              required
              value={accountId}
            >
              <option value="">Choose an account</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </div>
          <div className={fieldClass}>
            <span className={fieldLabelClass}>Date range</span>
            <button
              aria-haspopup="dialog"
              aria-label="Choose report date range"
              className={cn(inputClass, "flex items-center justify-between bg-white text-left")}
              onClick={() => setSheet("export-range")}
              type="button"
            >
              <span>{exportRangeLabel}</span>
              <CalendarRange aria-hidden="true" size={18} />
            </button>
            <input name="from" type="hidden" value={exportFrom} />
            <input name="to" type="hidden" value={exportTo} />
          </div>
          <p className="m-0 text-[.76rem] leading-relaxed text-muted">
            A PDF with this account’s transactions for the selected dates will be emailed to the address above. Reports include dates through today.
          </p>
        </form>
      </BottomSheet>
      <BottomSheet
        open={sheet === "export-range"}
        onClose={() => setSheet("export")}
        title="Report dates"
        ariaLabel="Report dates"
        zIndex="z-[90]"
      >
        <CalendarRangeSelector
          from={exportFrom}
          to={exportTo}
          maxDays={366}
          onApply={(nextFrom, nextTo) => {
            setExportFrom(nextFrom);
            setExportTo(nextTo);
            setSheet("export");
          }}
          onCancel={() => setSheet("export")}
        />
      </BottomSheet>
    </div>
  );
}
