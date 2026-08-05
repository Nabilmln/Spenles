"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import type { CategoryStatusActionState } from "../actions/category-actions";

export function CategoryStatusForm({
  action,
  categoryId,
  label,
}: {
  action: (
    state: CategoryStatusActionState,
    formData: FormData,
  ) => Promise<CategoryStatusActionState>;
  categoryId: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={categoryId} />
      <button className="button button-secondary" type="submit" disabled={pending}>
        {pending ? "Memproses..." : label}
      </button>
      <FormMessage>{state.error}</FormMessage>
    </form>
  );
}
