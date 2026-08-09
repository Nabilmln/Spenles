"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldClass, fieldLabelClass, successMessageClass, textareaClass } from "@/components/ui/styles";
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
    <form action={action} className="grid gap-4">
      <div className="grid grid-cols-[1fr_1fr] gap-4 max-[540px]:grid-cols-1">
        <div className={fieldClass}>
          <label htmlFor="transfer-source" className={fieldLabelClass}>Dari akun</label>
          <Select id="transfer-source" name="sourceAccountId" required>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
        </div>
        <div className={fieldClass}>
          <label htmlFor="transfer-destination" className={fieldLabelClass}>Ke akun</label>
          <Select id="transfer-destination" name="destinationAccountId" required>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
        </div>
      </div>
      <div className={fieldClass}>
        <label htmlFor="transfer-amount" className={fieldLabelClass}>Jumlah (IDR)</label>
        <Input id="transfer-amount" name="amount" type="number" min="1" step="1" required />
      </div>
      <div className={fieldClass}>
        <label htmlFor="transfer-at" className={fieldLabelClass}>Waktu transfer</label>
        <Input
          id="transfer-at"
          name="transferredAt"
          type="datetime-local"
          defaultValue={formatJakartaDateTimeInput(new Date())}
          required
        />
      </div>
      <div className={fieldClass}>
        <label htmlFor="transfer-note" className={fieldLabelClass}>Catatan (opsional)</label>
        <textarea className={textareaClass} id="transfer-note" name="note" maxLength={500} />
      </div>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p className={successMessageClass} role="status">{state.success}</p> : null}
      <Button type="submit" disabled={pending || accounts.length < 2}>
        {pending ? "Menyimpan..." : "Catat transfer"}
      </Button>
    </form>
  );
}
