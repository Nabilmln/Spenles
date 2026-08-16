"use client";

import { useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldClass, fieldLabelClass, textareaClass } from "@/components/ui/styles";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import type { RecurringActionState } from "../actions/recurring-actions";
import { RECURRING_FREQUENCIES } from "../constants/frequencies";

export function RecurringRuleForm({
  action,
  accounts,
  categories,
  defaultStart,
  initial,
}: {
  action: (
    state: RecurringActionState,
    data: FormData,
  ) => Promise<RecurringActionState>;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: "income" | "expense" }>;
  defaultStart?: string;
  initial?: {
    id: string;
    type: "income" | "expense";
    amount: string;
    accountId: string;
    categoryId: string;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    endDate: string | null;
    note: string | null;
  };
}) {
  const [, formAction, pending] = useToastActionState(action, {});
  const [generatedDefaultStart] = useState(() =>
    formatJakartaDateTimeInput(new Date(Date.now() + 60_000)),
  );
  const startValue = defaultStart ?? generatedDefaultStart;
  return (
    <form action={formAction} className="grid gap-4">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className={fieldClass}>
        <label htmlFor="recurring-type" className={fieldLabelClass}>Jenis transaksi</label>
        <Select id="recurring-type" name="type" defaultValue={initial?.type ?? "expense"}>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </Select>
      </div>
      <div className={fieldClass}>
        <label htmlFor="recurring-amount" className={fieldLabelClass}>Jumlah (IDR)</label>
        <Input id="recurring-amount" name="amount" type="number" min="1" step="1" defaultValue={initial?.amount} required />
      </div>
      <div className="grid grid-cols-2 gap-4 max-[540px]:grid-cols-1">
        <div className={fieldClass}>
          <label htmlFor="recurring-account" className={fieldLabelClass}>Akun</label>
          <Select id="recurring-account" name="accountId" defaultValue={initial?.accountId} required>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </Select>
        </div>
        <div className={fieldClass}>
          <label htmlFor="recurring-category" className={fieldLabelClass}>Kategori</label>
          <Select id="recurring-category" name="categoryId" defaultValue={initial?.categoryId} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.type === "income" ? "Pemasukan" : "Pengeluaran"} · {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className={fieldClass}>
        <label htmlFor="recurring-frequency" className={fieldLabelClass}>Frekuensi</label>
        <Select id="recurring-frequency" name="frequency" defaultValue={initial?.frequency ?? "monthly"}>
          {RECURRING_FREQUENCIES.map((frequency) => <option key={frequency.value} value={frequency.value}>{frequency.label}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[540px]:grid-cols-1">
        <div className={fieldClass}>
          <label htmlFor="recurring-start" className={fieldLabelClass}>Mulai</label>
          <Input id="recurring-start" name="startAt" type="datetime-local" defaultValue={startValue} disabled={Boolean(initial)} required />
          {initial ? <input type="hidden" name="startAt" value={startValue} /> : null}
        </div>
        <div className={fieldClass}>
          <label htmlFor="recurring-end" className={fieldLabelClass}>Tanggal selesai (opsional)</label>
          <Input id="recurring-end" name="endDate" type="date" defaultValue={initial?.endDate ?? ""} />
        </div>
      </div>
      <div className={fieldClass}>
        <label htmlFor="recurring-note" className={fieldLabelClass}>Catatan (opsional)</label>
        <textarea className={textareaClass} id="recurring-note" name="note" defaultValue={initial?.note ?? ""} maxLength={500} />
      </div>
      <Button type="submit" disabled={pending || accounts.length === 0 || categories.length === 0}>
        {pending ? "Menyimpan..." : initial ? "Simpan perubahan" : "Buat aturan"}
      </Button>
    </form>
  );
}
