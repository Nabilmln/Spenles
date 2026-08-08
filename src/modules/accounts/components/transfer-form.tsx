"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { successMessageClass } from "@/components/ui/styles";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import {
  createTransferAction,
  type TransferActionState,
} from "../actions/transfer-actions";

export function TransferForm({
  accounts,
}: {
  accounts: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState<
    TransferActionState,
    FormData
  >(createTransferAction, {});
  return (
    <form action={action} className="domain-form">
      <div className="settings-grid">
        <div className="field">
          <label htmlFor="transfer-source">Dari akun</label>
          <Select id="transfer-source" name="sourceAccountId" required>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
        </div>
        <div className="field">
          <label htmlFor="transfer-destination">Ke akun</label>
          <Select id="transfer-destination" name="destinationAccountId" required>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="transfer-amount">Jumlah (IDR)</label>
        <Input id="transfer-amount" name="amount" type="number" min="1" step="1" required />
      </div>
      <div className="field">
        <label htmlFor="transfer-at">Waktu transfer</label>
        <Input
          id="transfer-at"
          name="transferredAt"
          type="datetime-local"
          defaultValue={formatJakartaDateTimeInput(new Date())}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="transfer-note">Catatan (opsional)</label>
        <textarea className="input textarea" id="transfer-note" name="note" maxLength={500} />
      </div>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p className={successMessageClass} role="status">{state.success}</p> : null}
      <Button type="submit" disabled={pending || accounts.length < 2}>
        {pending ? "Menyimpan..." : "Catat transfer"}
      </Button>
    </form>
  );
}
