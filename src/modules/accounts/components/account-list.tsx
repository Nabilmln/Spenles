"use client";

import { useState } from "react";
import type { AccountBalanceRow } from "../queries/accounts";
import { AccountCard } from "./account-card";
import { AccountDetailSheet } from "./account-detail-sheet";

export function AccountList({ rows }: { rows: AccountBalanceRow[] }) {
  const [selected, setSelected] = useState<AccountBalanceRow | null>(null);

  return (
    <section aria-label="Accounts">
      {rows.length ? (
        <div className="grid gap-[.9rem] max-[540px]:grid-cols-1 max-[1100px]:grid-cols-[repeat(2,minmax(0,1fr))] min-[1101px]:grid-cols-[repeat(3,minmax(0,1fr))]">
          {rows.map((account) => (
            <AccountCard key={account.id} account={account} onDetail={setSelected} />
          ))}
        </div>
      ) : (
        <p className="m-0 rounded-[1.4rem] border border-dashed border-border bg-surface-subtle p-6 text-center text-[.85rem] text-muted">
          No accounts yet.
        </p>
      )}

      <AccountDetailSheet row={selected} onClose={() => setSelected(null)} />
    </section>
  );
}