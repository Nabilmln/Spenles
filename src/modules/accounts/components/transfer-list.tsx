"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { formatJakartaDateTime } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import {
  reverseTransferAction,
  type TransferActionState,
} from "../actions/transfer-actions";
import type { TransferListRow } from "../queries/transfers";

function ReversalForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<
    TransferActionState,
    FormData
  >(reverseTransferAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Membalik..." : "Balikkan"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p className="success-message">{state.success}</p> : null}
    </form>
  );
}

export function TransferList({ rows }: { rows: TransferListRow[] }) {
  if (rows.length === 0) {
    return <div className="empty-state"><p>Belum ada riwayat transfer.</p></div>;
  }
  return (
    <div className="transaction-list">
      {rows.map((row) => (
        <article className="card transfer-row" key={row.id}>
          <div>
            <strong>{row.sourceName} → {row.destinationName}</strong>
            <p>{formatJakartaDateTime(row.transferredAt)}</p>
            {row.note ? <p>{row.note}</p> : null}
          </div>
          <strong>{formatIdr(row.amount)}</strong>
          {row.reversalOfId ? (
            <span className="status-badge status-archived">Pembalikan</span>
          ) : row.reversed ? (
            <span className="status-badge status-archived">Sudah dibalik</span>
          ) : (
            <ReversalForm id={row.id} />
          )}
        </article>
      ))}
    </div>
  );
}
