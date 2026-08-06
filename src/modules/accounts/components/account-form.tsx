"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { AccountActionState } from "../actions/account-actions";
import { ACCOUNT_TYPES } from "../constants/account-types";

export function AccountForm({
  action,
  initial,
}: {
  action: (
    state: AccountActionState,
    data: FormData,
  ) => Promise<AccountActionState>;
  initial?: {
    id: string;
    name: string;
    type: "cash" | "bank" | "e_wallet" | "savings" | "other";
    openingBalance: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="domain-form">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="field">
        <label htmlFor="account-name">Nama akun</label>
        <Input
          id="account-name"
          name="name"
          defaultValue={initial?.name}
          maxLength={80}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="account-type">Jenis akun</label>
        <select
          className="input"
          id="account-type"
          name="type"
          defaultValue={initial?.type ?? "cash"}
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="opening-balance">Saldo awal (IDR)</label>
        <Input
          id="opening-balance"
          name="openingBalance"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          defaultValue={initial?.openingBalance ?? "0"}
          required
        />
        {initial ? (
          <small>Saldo awal hanya dapat diubah sebelum akun memiliki riwayat.</small>
        ) : null}
      </div>
      <FormMessage>{state.error}</FormMessage>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : initial ? "Simpan perubahan" : "Buat akun"}
      </Button>
    </form>
  );
}
