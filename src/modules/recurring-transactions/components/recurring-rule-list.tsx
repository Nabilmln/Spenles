"use client";

import Link from "next/link";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { buttonClass, cardClass, emptyStateClass, eyebrowClass } from "@/components/ui/styles";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import {
  archiveRecurringRuleAction,
  pauseRecurringRuleAction,
  resumeRecurringRuleAction,
  type RecurringActionState,
} from "../actions/recurring-actions";
import { recurringFrequencyLabel } from "../constants/frequencies";
import type { RecurringRuleListRow } from "../queries/recurring-rules";

const reasonLabel = {
  user: "Paused by user",
  blocked_account: "Account inactive",
  blocked_category: "Category inactive",
  generation_failure: "Last generation failed",
};

const statusBadgeClass: Record<RecurringRuleListRow["status"], string> = {
  active:
    "inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] text-[.72rem] font-medium whitespace-nowrap text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  paused:
    "inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] text-[.72rem] font-medium whitespace-nowrap text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  archived:
    "inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] text-[.72rem] font-medium whitespace-nowrap text-muted bg-surface-subtle",
};

function StatusForm({
  row,
  operation,
}: {
  row: RecurringRuleListRow;
  operation: "pause" | "resume" | "archive";
}) {
  const action =
    operation === "pause"
      ? pauseRecurringRuleAction
      : operation === "resume"
        ? resumeRecurringRuleAction
        : archiveRecurringRuleAction;
  const [, formAction, pending] = useToastActionState<
    RecurringActionState,
    FormData
  >(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={row.id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Processing..." : operation === "pause" ? "Pause" : operation === "resume" ? "Resume" : "Archive"}
      </Button>
    </form>
  );
}

export function RecurringRuleList({ rows }: { rows: RecurringRuleListRow[] }) {
  if (rows.length === 0) return <div className={emptyStateClass}><p className="m-0 text-muted">No recurring transaction rules yet.</p></div>;
  return (
    <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[540px]:grid-cols-1">
      {rows.map((row) => (
        <article className={`${cardClass} grid gap-[.9rem] min-w-0`} key={row.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={eyebrowClass}>{recurringFrequencyLabel(row.frequency)}</p>
              <h2>{row.categoryName}</h2>
            </div>
            <span className={statusBadgeClass[row.status]}>
              {row.status === "active" ? "Active" : row.status === "paused" ? "Paused" : "Archived"}
            </span>
          </div>
          <strong className={`[overflow-wrap:anywhere] text-[clamp(1.35rem,2.7vw,2rem)] ${row.type === "income" ? "text-income" : "text-expense"}`}>
            {formatIdr(row.amount)}
          </strong>
          <p>{row.accountName} · {row.type === "income" ? "Income" : "Expense"}</p>
          <p>
            Next: {row.nextOccurrenceAt ? formatJakartaDateLong(row.nextOccurrenceAt) : "None"}
          </p>
          {row.pauseReason ? (
            <p className="text-expense! font-medium">{reasonLabel[row.pauseReason]}</p>
          ) : null}
          <div className="flex items-center gap-2">
            {row.status !== "archived" ? <Link className={buttonClass("secondary")} href={`/recurring-transactions/${row.id}/edit`}>Edit</Link> : null}
            {row.status === "active" ? <StatusForm row={row} operation="pause" /> : null}
            {row.status === "paused" ? <StatusForm row={row} operation="resume" /> : null}
            {row.status !== "archived" ? <StatusForm row={row} operation="archive" /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
