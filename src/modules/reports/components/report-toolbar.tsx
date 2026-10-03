"use client";

import { useState } from "react";
import { CalendarRange, ChevronRight, Send, Upload } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CalendarRangeSelector } from "@/components/ui/calendar-range-selector";
import { buttonClass, fieldClass, fieldLabelClass, inputClass } from "@/components/ui/styles";
import { useToastActionState } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { AccountSelectionSheet } from "@/modules/transactions/components/selection-sheets";
import { emailReportAction, type EmailReportState } from "../actions/email-report";
import { formatReportDateChip, formatReportRange, formatReportRangeShort } from "../lib/report-date";

type Sheet = "none" | "range" | "export" | "export-account" | "export-range";

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
  const exportRangeLabel = formatReportRangeShort(exportFrom, exportTo);
  const selectedAccount = accounts.find((account) => account.id === accountId);

  function applyRange(nextFrom: string, nextTo: string) {
    setSheet("none");
    const url = new URL(window.location.href);
    url.searchParams.set("from", nextFrom);
    url.searchParams.set("to", nextTo);
    window.location.href = url.toString();
  }

  return (
    <div>
      <div className="flex gap-[.2rem]">
        <button
          aria-label={`Select date range: ${rangeLabel}`}
          className={cn(
            triggerClass,
            "flex min-h-[3.05rem] min-w-0 flex-1 items-center gap-[.35rem] p-[.45rem_.55rem] text-left",
          )}
          onClick={() => setSheet("range")}
          type="button"
        >
          <span className="grid w-[1.9rem] shrink-0 justify-items-center gap-[.1rem]">
            <CalendarRange aria-hidden="true" size={25} />
          </span>
          <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[.18rem] whitespace-nowrap">
            <span className="min-w-0 rounded-[.42rem] bg-primary-700 px-[.3rem] py-[.5rem] text-center text-[.8rem] font-semibold leading-none text-white">
              {formatReportDateChip(from)}
            </span>
            <span className="text-[.8rem] font-medium text-muted">-</span>
            <span className="min-w-0 rounded-[.42rem] bg-primary-700 px-[.3rem] py-[.5rem] text-center text-[.8rem] font-semibold leading-none text-white">
              {formatReportDateChip(to)}
            </span>
          </span>
        </button>
        <button
          aria-haspopup="dialog"
          aria-label="Export report"
          className={cn(
            triggerClass,
            "grid size-[3.05rem] shrink-0 place-items-center p-0",
          )}
          onClick={() => setSheet("export")}
          type="button"
        >
          <Upload aria-hidden="true" size={20} />
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
          <button className={cn(buttonClass("primary"), "w-full")} disabled={sending || !accountId} form="email-report-form" type="submit">
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
            <span className={fieldLabelClass} id="report-account-label">Source account</span>
            <button
              aria-haspopup="dialog"
              aria-labelledby="report-account-label report-account-value"
              className={cn(inputClass, "flex items-center justify-between gap-2 bg-white text-left")}
              disabled={accounts.length === 0}
              onClick={() => setSheet("export-account")}
              type="button"
            >
              <span className="min-w-0 truncate" id="report-account-value">{selectedAccount?.name ?? "Choose an account"}</span>
              <ChevronRight aria-hidden="true" className="shrink-0 text-muted" size={18} />
            </button>
            <input name="accountId" type="hidden" value={accountId} />
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
            A PDF with this account’s transactions for the selected dates will be emailed to the address above.
          </p>
        </form>
      </BottomSheet>
      <AccountSelectionSheet
        accounts={accounts}
        onClose={() => setSheet("export")}
        onSelect={setAccountId}
        open={sheet === "export-account"}
        selectedId={accountId}
        zIndex="z-[90]"
      />
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
