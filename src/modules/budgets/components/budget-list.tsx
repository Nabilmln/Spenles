"use client";

import Link from "next/link";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  buttonClass,
  cardClass,
  emptyStateClass,
  eyebrowClass,
} from "@/components/ui/styles";
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

const statusBadgeClass = {
  safe: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  warning: "text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  exceeded: "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]",
};

function BudgetStatusForm({ row }: { row: BudgetListRow }) {
  const action =
    row.recordStatus === "active" ? archiveBudgetAction : restoreBudgetAction;
  const [, formAction, pending] = useToastActionState<
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
    </form>
  );
}

export function BudgetList({ rows }: { rows: BudgetListRow[] }) {
  if (rows.length === 0) {
    return <div className={emptyStateClass}><p className="m-0 text-muted">Belum ada anggaran bulanan.</p></div>;
  }
  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4 max-[1100px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[540px]:grid-cols-1">
      {rows.map((row) => {
        const percent = BigInt(row.percentageBps);
        const progress = Number(percent > 10_000n ? 10_000n : percent) / 100;
        return (
          <article className={`${cardClass} grid min-w-0 gap-[.9rem]`} key={row.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowClass}>{row.month}</p>
                <h2>{row.categoryName}</h2>
              </div>
              <span className={`inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] text-[.72rem] font-medium whitespace-nowrap ${statusBadgeClass[row.budgetStatus]}`}>
                {statusLabel[row.budgetStatus]}
              </span>
            </div>
            <div
              className="h-[.7rem] overflow-hidden rounded-full bg-surface-subtle"
              role="progressbar"
              aria-label={`Pemakaian anggaran ${row.categoryName}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-valuetext={`${formatPercentageBps(percent)} digunakan`}
            >
              <span className="block h-full rounded-[inherit] bg-primary-600" style={{ width: `${progress}%` }} />
            </div>
            <dl className="m-0 grid grid-cols-2 gap-[.65rem]">
              <div className="grid gap-[.15rem]"><dt className="text-[.72rem] text-muted">Anggaran</dt><dd className="m-0 font-medium">{formatIdr(row.amount)}</dd></div>
              <div className="grid gap-[.15rem]"><dt className="text-[.72rem] text-muted">Terpakai</dt><dd className="m-0 font-medium">{formatIdr(row.usage)}</dd></div>
              <div className="grid gap-[.15rem]"><dt className="text-[.72rem] text-muted">Sisa</dt><dd className="m-0 font-medium">{formatIdr(row.remaining)}</dd></div>
              <div className="grid gap-[.15rem]"><dt className="text-[.72rem] text-muted">Persentase</dt><dd className="m-0 font-medium">{formatPercentageBps(percent)}</dd></div>
            </dl>
            <div className="flex items-center gap-2">
              {row.recordStatus === "active" ? (
                <Link className={buttonClass("secondary")} href={`/budgets/${row.id}/edit`}>Edit</Link>
              ) : null}
              <BudgetStatusForm row={row} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
