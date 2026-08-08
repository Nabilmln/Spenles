"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { buttonClass, emptyStateClass } from "@/components/ui/styles";
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
  user: "Dijeda pengguna",
  blocked_account: "Akun tidak aktif",
  blocked_category: "Kategori tidak aktif",
  generation_failure: "Generasi terakhir gagal",
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
  const [state, formAction, pending] = useActionState<
    RecurringActionState,
    FormData
  >(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={row.id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Memproses..." : operation === "pause" ? "Jeda" : operation === "resume" ? "Lanjutkan" : "Arsipkan"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
    </form>
  );
}

export function RecurringRuleList({ rows }: { rows: RecurringRuleListRow[] }) {
  if (rows.length === 0) return <div className={emptyStateClass}><p className="m-0 text-muted">Belum ada aturan transaksi berulang.</p></div>;
  return (
    <div className="domain-grid">
      {rows.map((row) => (
        <article className="card domain-card" key={row.id}>
          <div className="domain-card-heading">
            <div>
              <p className="eyebrow">{recurringFrequencyLabel(row.frequency)}</p>
              <h2>{row.categoryName}</h2>
            </div>
            <span className={`status-badge status-${row.status}`}>
              {row.status === "active" ? "Aktif" : row.status === "paused" ? "Dijeda" : "Diarsipkan"}
            </span>
          </div>
          <strong className={row.type === "income" ? "transaction-amount income" : "transaction-amount expense"}>
            {formatIdr(row.amount)}
          </strong>
          <p>{row.accountName} · {row.type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
          <p>
            Berikutnya: {row.nextOccurrenceAt ? formatJakartaDateLong(row.nextOccurrenceAt) : "Tidak ada"}
          </p>
          {row.pauseReason ? (
            <p className="warning-copy">{reasonLabel[row.pauseReason]}</p>
          ) : null}
          <div className="form-actions">
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
