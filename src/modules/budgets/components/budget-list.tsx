"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { formatIdr } from "@/lib/money/format-idr";
import {
  archiveBudgetAction,
  restoreBudgetAction,
  type BudgetActionState,
} from "../actions/budget-actions";
import type { BudgetListRow } from "../queries/budgets";
import { formatPercentageBps } from "../services/budget-metrics";

const statusLabel = {
  safe: "Aman",
  warning: "Peringatan",
  exceeded: "Terlewati",
};

function BudgetStatusForm({ row }: { row: BudgetListRow }) {
  const action =
    row.recordStatus === "active" ? archiveBudgetAction : restoreBudgetAction;
  const [state, formAction, pending] = useActionState<
    BudgetActionState,
    FormData
  >(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={row.id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending
          ? "Memproses..."
          : row.recordStatus === "active"
            ? "Arsipkan"
            : "Pulihkan"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
    </form>
  );
}

export function BudgetList({ rows }: { rows: BudgetListRow[] }) {
  if (rows.length === 0) {
    return <div className="empty-state"><p>Belum ada anggaran bulanan.</p></div>;
  }
  return (
    <div className="domain-grid">
      {rows.map((row) => {
        const percent = BigInt(row.percentageBps);
        const progress = Number(percent > 10_000n ? 10_000n : percent) / 100;
        return (
          <article className="card domain-card" key={row.id}>
            <div className="domain-card-heading">
              <div>
                <p className="eyebrow">{row.month}</p>
                <h2>{row.categoryName}</h2>
              </div>
              <span className={`status-badge budget-${row.budgetStatus}`}>
                {statusLabel[row.budgetStatus]}
              </span>
            </div>
            <div
              className="budget-progress"
              role="progressbar"
              aria-label={`Pemakaian anggaran ${row.categoryName}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-valuetext={`${formatPercentageBps(percent)} digunakan`}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <dl className="budget-metrics">
              <div><dt>Anggaran</dt><dd>{formatIdr(row.amount)}</dd></div>
              <div><dt>Terpakai</dt><dd>{formatIdr(row.usage)}</dd></div>
              <div><dt>Sisa</dt><dd>{formatIdr(row.remaining)}</dd></div>
              <div><dt>Persentase</dt><dd>{formatPercentageBps(percent)}</dd></div>
            </dl>
            <div className="form-actions">
              {row.recordStatus === "active" ? (
                <Link className="button button-secondary" href={`/budgets/${row.id}/edit`}>Edit</Link>
              ) : null}
              <BudgetStatusForm row={row} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
