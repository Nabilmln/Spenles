"use client";

import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { AmountInput } from "@/components/ui/amount-input";
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
        <label htmlFor="account-name" className={fieldLabelClass}>Account name</label>
        <Input
          id="account-name"
          name="name"
          defaultValue={initial?.name}
          maxLength={80}
          required
        />
      </div>
      <div className={fieldClass}>
        <label htmlFor="account-type" className={fieldLabelClass}>Account type</label>
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
        <label htmlFor="opening-balance" className={fieldLabelClass}>Opening balance (IDR)</label>
        <AmountInput
          id="opening-balance"
          name="openingBalance"
          defaultValue={initial?.openingBalance ?? "0"}
          required
        />
        {initial ? (
          <small className="text-muted">Opening balance can only be changed before the account has any history.</small>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : initial ? "Save changes" : "Create account"}
      </Button>
    </form>
  );
}
