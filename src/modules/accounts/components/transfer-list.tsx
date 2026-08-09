"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { cardClass, emptyStateClass, successMessageClass } from "@/components/ui/styles";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import {
  reverseTransferAction,
  type TransferActionState,
} from "../actions/transfer-actions";
import type { TransferListRow } from "../queries/transfers";

const archivedBadgeClass =
  "inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] whitespace-nowrap text-[.72rem] font-medium text-muted bg-surface-subtle max-[540px]:col-span-full max-[540px]:justify-self-start";

function ReversalForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<
    TransferActionState,
    FormData
  >(reverseTransferAction, {});
  return (
    <form action={action} className="max-[540px]:col-span-full max-[540px]:justify-self-start">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Membalik..." : "Balikkan"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p className={successMessageClass}>{state.success}</p> : null}
    </form>
  );
}

export function TransferList({ rows }: { rows: TransferListRow[] }) {
  if (rows.length === 0) {
    return <div className={emptyStateClass}><p className="m-0 text-muted">Belum ada riwayat transfer.</p></div>;
  }
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <article className={`${cardClass} grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 max-[540px]:grid-cols-[minmax(0,1fr)_auto]`} key={row.id}>
          <div>
            <strong>{row.sourceName} → {row.destinationName}</strong>
            <p className="mt-[.2rem] text-muted text-[.78rem]!">{formatJakartaDateLong(row.transferredAt)}</p>
            {row.note ? <p className="mt-[.2rem] text-muted text-[.78rem]!">{row.note}</p> : null}
          </div>
          <strong>{formatIdr(row.amount)}</strong>
          {row.reversalOfId ? (
            <span className={archivedBadgeClass}>Pembalikan</span>
          ) : row.reversed ? (
            <span className={archivedBadgeClass}>Sudah dibalik</span>
          ) : (
            <ReversalForm id={row.id} />
          )}
        </article>
      ))}
    </div>
  );
}
