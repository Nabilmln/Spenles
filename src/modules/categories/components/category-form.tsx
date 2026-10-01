"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToastActionState } from "@/components/ui/toast";
import { fieldClass, fieldLabelClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import type { CategoryActionState } from "../actions/category-actions";
import { CategoryIconPicker } from "./category-icon-picker";

const CATEGORY_TYPES = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
] as const;

export function CategoryForm({
  action,
  initial,
  formId,
  onClose,
}: {
  action: (state: CategoryActionState, data: FormData) => Promise<CategoryActionState>;
  initial?: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
  };
  formId?: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useToastActionState(action, {});
  const key = initial?.id ?? "new";
  const [type, setType] = useState<"income" | "expense">(initial?.type ?? "expense");
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
    onClose?.();
  }, [state.success, router, onClose]);

  return (
    <form action={formAction} className="grid gap-4" id={formId}>
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="type" value={type} />
      <div className={fieldClass}>
        <label htmlFor={`category-name-${key}`} className={fieldLabelClass}>Category name</label>
        <Input id={`category-name-${key}`} name="name" defaultValue={initial?.name} maxLength={80} required />
      </div>
      {!initial ? (
        <div className={fieldClass}>
          <label htmlFor={`category-type-${key}`} className={fieldLabelClass}>Type</label>
          <button
            type="button"
            id={`category-type-${key}`}
            className="flex w-full min-h-[2.6rem] cursor-pointer items-center justify-between gap-[.5rem] rounded-[1.12rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-left font-medium text-foreground transition-[border,box-shadow] duration-150 hover:border-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(23_23_23/12%)] focus:outline-none"
            onClick={() => setTypeSheetOpen(true)}
          >
            <span>{CATEGORY_TYPES.find((option) => option.value === type)?.label ?? type}</span>
            <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
          </button>
        </div>
      ) : null}
      <CategoryIconPicker value={icon} onChange={setIcon} />
      <Button className="w-full justify-center" type="submit" disabled={pending}>{pending ? "Saving..." : initial ? "Save changes" : "Add Category"}</Button>

      {!initial ? (
        <BottomSheet
          open={typeSheetOpen}
          onClose={() => setTypeSheetOpen(false)}
          title="Category Type"
          ariaLabel="Choose category type"
          zIndex="z-[85]"
        >
          <div className="grid gap-[.4rem]">
            {CATEGORY_TYPES.map((option) => (
              <button
                type="button"
                key={option.value}
                className={cn(
                  "flex min-h-[2.7rem] w-full cursor-pointer items-center justify-between gap-[.6rem] rounded-[1.12rem] border-0 px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors hover:bg-surface-subtle",
                  type === option.value && "bg-primary-50 text-primary-700",
                )}
                onClick={() => {
                  setType(option.value);
                  setTypeSheetOpen(false);
                }}
              >
                <span>{option.label}</span>
                {type === option.value ? <Check aria-hidden="true" className="shrink-0" size={18} /> : null}
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </form>
  );
}
