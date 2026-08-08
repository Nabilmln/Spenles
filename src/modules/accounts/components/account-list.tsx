"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { buttonClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import {
  archiveAccountAction,
  restoreAccountAction,
  type AccountActionState,
} from "../actions/account-actions";
import { accountTypeLabel } from "../constants/account-types";
import type { AccountBalanceRow } from "../queries/accounts";

function AccountStatusForm({
  row,
}: {
  row: AccountBalanceRow;
}) {
  const action =
    row.status === "active" ? archiveAccountAction : restoreAccountAction;
  const [state, formAction, pending] = useActionState<
    AccountActionState,
    FormData
  >(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={row.id} />
      <Button
        type="submit"
        variant="ghost"
        disabled={pending}
        aria-label={`${row.status === "active" ? "Arsipkan" : "Pulihkan"} ${row.name}`}
      >
        {pending
          ? "Memproses..."
          : row.status === "active"
            ? "Arsipkan"
            : "Pulihkan"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
    </form>
  );
}

export function AccountList({ rows }: { rows: AccountBalanceRow[] }) {
  return (
    <div className="domain-grid">
      {rows.map((row) => {
        const negative = BigInt(row.balance) < 0n;
        return (
          <article className="card domain-card" key={row.id}>
            <div className="domain-card-heading">
              <div>
                <p className="eyebrow">{accountTypeLabel(row.type)}</p>
                <h2>{row.name}</h2>
              </div>
              <span className={`status-badge status-${row.status}`}>
                {row.status === "active" ? "Aktif" : "Diarsipkan"}
              </span>
            </div>
            <p className="balance-label">Saldo saat ini</p>
            <strong className={negative ? "negative-balance" : undefined}>
              {formatIdr(row.balance)}
            </strong>
            {negative ? (
              <p className="warning-copy">Saldo akun negatif.</p>
            ) : null}
            <div className="form-actions">
              <Link className={buttonClass("secondary")} href={`/accounts/${row.id}`}>
                Detail
              </Link>
              <AccountStatusForm row={row} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
