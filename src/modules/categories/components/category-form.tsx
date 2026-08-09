"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fieldClass, fieldLabelClass, successMessageClass } from "@/components/ui/styles";
import type { CategoryActionState } from "../actions/category-actions";
import { CATEGORY_COLORS } from "../constants/category-options";
import { CategoryIconPicker } from "./category-icon-picker";

export function CategoryForm({
  action,
  initial,
  formId,
}: {
  action: (state: CategoryActionState, data: FormData) => Promise<CategoryActionState>;
  initial?: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
    color: string | null;
  };
  formId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const key = initial?.id ?? "new";
  return (
    <form action={formAction} className="grid gap-4" id={formId}>
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className={fieldClass}>
        <label htmlFor={`category-name-${key}`} className={fieldLabelClass}>Nama kategori</label>
        <Input id={`category-name-${key}`} name="name" defaultValue={initial?.name} maxLength={80} required />
      </div>
      {!initial ? (
        <div className={fieldClass}>
          <label htmlFor={`category-type-${key}`} className={fieldLabelClass}>Jenis</label>
          <Select id={`category-type-${key}`} name="type" defaultValue="expense">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pendapatan</option>
          </Select>
        </div>
      ) : null}
      <CategoryIconPicker value={initial?.icon ?? null} />
      <div className={fieldClass}>
        <label htmlFor={`category-color-${key}`} className={fieldLabelClass}>Warna</label>
        <Select id={`category-color-${key}`} name="color" defaultValue={initial?.color ?? ""}>
          <option value="">Warna standar</option>
          {CATEGORY_COLORS.map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
      </div>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p className={successMessageClass}>{state.success}</p> : null}
      <Button className="w-full justify-center" type="submit" disabled={pending}>{pending ? "Menyimpan..." : initial ? "Simpan perubahan" : "Tambah Kategori"}</Button>
    </form>
  );
}
