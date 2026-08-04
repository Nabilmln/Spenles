"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import type { CategoryActionState } from "../actions/category-actions";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants/category-options";

export function CategoryForm({
  action,
  initial,
}: {
  action: (state: CategoryActionState, data: FormData) => Promise<CategoryActionState>;
  initial?: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
    color: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="category-form">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="field">
        <label htmlFor={`name-${initial?.id ?? "new"}`}>Nama</label>
        <Input id={`name-${initial?.id ?? "new"}`} name="name" defaultValue={initial?.name} maxLength={80} required />
      </div>
      {!initial ? (
        <div className="field">
          <label htmlFor="category-type">Jenis</label>
          <select className="input" id="category-type" name="type" defaultValue="expense">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>
      ) : null}
      <div className="settings-grid">
        <div className="field">
          <label htmlFor={`icon-${initial?.id ?? "new"}`}>Ikon</label>
          <select className="input" id={`icon-${initial?.id ?? "new"}`} name="icon" defaultValue={initial?.icon ?? ""}>
            <option value="">Tanpa ikon</option>
            {CATEGORY_ICONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`color-${initial?.id ?? "new"}`}>Warna</label>
          <select className="input" id={`color-${initial?.id ?? "new"}`} name="color" defaultValue={initial?.color ?? ""}>
            <option value="">Warna standar</option>
            {CATEGORY_COLORS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p className="success-message">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : initial ? "Simpan perubahan" : "Tambah kategori"}</Button>
    </form>
  );
}
