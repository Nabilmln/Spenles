"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { buttonClass } from "@/components/ui/styles";
import type { AccountBalanceRow } from "../queries/accounts";
import { AccountCard } from "./account-card";
import { AccountCreateSheet } from "./account-create-sheet";
import { AccountDetailSheet } from "./account-detail-sheet";

export function AccountList({ rows }: { rows: AccountBalanceRow[] }) {
  const [selected, setSelected] = useState<AccountBalanceRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <section aria-label="Accounts">
      <button
        type="button"
        className={`${buttonClass("primary")} mb-[.9rem] w-full justify-center`}
        onClick={() => setCreating(true)}
      >
        <Plus size={18} aria-hidden="true" />
        Add Account
      </button>

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
      <AccountCreateSheet open={creating} onClose={() => setCreating(false)} />
    </section>
  );
}