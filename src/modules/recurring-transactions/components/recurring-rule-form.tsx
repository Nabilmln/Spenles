"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
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
  const [state, formAction, pending] = useActionState(action, {});
  const [generatedDefaultStart] = useState(() =>
    formatJakartaDateTimeInput(new Date(Date.now() + 60_000)),
  );
  const startValue = defaultStart ?? generatedDefaultStart;
  return (
    <form action={formAction} className="domain-form">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="field">
        <label htmlFor="recurring-type">Jenis transaksi</label>
        <select className="input" id="recurring-type" name="type" defaultValue={initial?.type ?? "expense"}>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="recurring-amount">Jumlah (IDR)</label>
        <Input id="recurring-amount" name="amount" type="number" min="1" step="1" defaultValue={initial?.amount} required />
      </div>
      <div className="settings-grid">
        <div className="field">
          <label htmlFor="recurring-account">Akun</label>
          <select className="input" id="recurring-account" name="accountId" defaultValue={initial?.accountId} required>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="recurring-category">Kategori</label>
          <select className="input" id="recurring-category" name="categoryId" defaultValue={initial?.categoryId} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.type === "income" ? "Pemasukan" : "Pengeluaran"} · {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="recurring-frequency">Frekuensi</label>
        <select className="input" id="recurring-frequency" name="frequency" defaultValue={initial?.frequency ?? "monthly"}>
          {RECURRING_FREQUENCIES.map((frequency) => <option key={frequency.value} value={frequency.value}>{frequency.label}</option>)}
        </select>
      </div>
      <div className="settings-grid">
        <div className="field">
          <label htmlFor="recurring-start">Mulai</label>
          <Input id="recurring-start" name="startAt" type="datetime-local" defaultValue={startValue} disabled={Boolean(initial)} required />
          {initial ? <input type="hidden" name="startAt" value={startValue} /> : null}
        </div>
        <div className="field">
          <label htmlFor="recurring-end">Tanggal selesai (opsional)</label>
          <Input id="recurring-end" name="endDate" type="date" defaultValue={initial?.endDate ?? ""} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="recurring-note">Catatan (opsional)</label>
        <textarea className="input textarea" id="recurring-note" name="note" defaultValue={initial?.note ?? ""} maxLength={500} />
      </div>
      <FormMessage>{state.error}</FormMessage>
      <Button type="submit" disabled={pending || accounts.length === 0 || categories.length === 0}>
        {pending ? "Menyimpan..." : initial ? "Simpan perubahan" : "Buat aturan"}
      </Button>
    </form>
  );
}
