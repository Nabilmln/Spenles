"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { buttonClass, cardClass, eyebrowClass } from "@/components/ui/styles";
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
    <form action={formAction} className="flex-1">
      <input type="hidden" name="id" value={row.id} />
      <Button
        type="submit"
        variant="blue"
        disabled={pending}
        aria-label={`${row.status === "active" ? "Arsipkan" : "Pulihkan"} ${row.name}`}
        className="w-full"
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
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4 max-[1100px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[540px]:grid-cols-1">
      {rows.map((row) => {
        const negative = BigInt(row.balance) < 0n;
        return (
          <article className={`${cardClass} grid min-w-0 gap-[.75rem]`} key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`${eyebrowClass} mb-[.15rem]!`}>{accountTypeLabel(row.type)}</p>
                <h2 className="m-0! truncate">{row.name}</h2>
              </div>
              <span className={`inline-flex min-h-[1.6rem] shrink-0 items-center rounded-full px-[.5rem] py-[.15rem] whitespace-nowrap text-[.7rem] font-medium ${row.status === "active" ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]" : "text-muted bg-surface-subtle"}`}>
                {row.status === "active" ? "Aktif" : "Diarsipkan"}
              </span>
            </div>
            <div className="grid gap-[.15rem]">
              <span className="text-[.78rem] text-muted">Saldo saat ini</span>
              <strong className={`wrap-anywhere text-[clamp(1.25rem,2.4vw,1.8rem)] ${negative ? "text-expense" : ""}`}>
                {formatIdr(row.balance)}
              </strong>
              {negative ? (
                <p className="m-0 font-medium text-expense!">Saldo akun negatif.</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 border-t border-border pt-[.75rem]">
              <Link className={buttonClass("blue", "flex-1 justify-center")} href={`/accounts/${row.id}`}>
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
