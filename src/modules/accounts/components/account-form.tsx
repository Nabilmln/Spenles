"use client";

import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
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
  const [, formAction, pending] = useToastActionState(action, {});
  return (
    <form action={formAction} className="grid gap-4">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className={fieldClass}>
        <label htmlFor="account-name" className={fieldLabelClass}>Nama akun</label>
        <Input
          id="account-name"
          name="name"
          defaultValue={initial?.name}
          maxLength={80}
          required
        />
      </div>
      <div className={fieldClass}>
        <label htmlFor="account-type" className={fieldLabelClass}>Jenis akun</label>
        <Select
          id="account-type"
          name="type"
          defaultValue={initial?.type ?? "cash"}
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={fieldClass}>
        <label htmlFor="opening-balance" className={fieldLabelClass}>Saldo awal (IDR)</label>
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
          <small className="text-muted">Saldo awal hanya dapat diubah sebelum akun memiliki riwayat.</small>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : initial ? "Simpan perubahan" : "Buat akun"}
      </Button>
    </form>
  );
}
