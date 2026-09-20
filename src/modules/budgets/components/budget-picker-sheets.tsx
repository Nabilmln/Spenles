"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";

export type BudgetCategoryOption = {
  id: string;
  name: string;
  icon: string | null;
};

function categoryOptionClass(selected: boolean) {
  return cn(
    "flex min-h-[3rem] cursor-pointer items-center gap-[.55rem] rounded-[.7rem] border px-[.65rem] py-[.55rem] text-left text-[.82rem] font-medium text-foreground transition-colors",
    selected
      ? "border-primary-600 bg-primary-50 text-primary-700"
      : "border-border bg-surface hover:bg-surface-subtle",
  );
}

export function BudgetCategorySheet({
  open,
  onClose,
  categories,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  categories: BudgetCategoryOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const sorted = useMemo(
    () =>
      [...categories].sort((left, right) =>
        left.name
          .toLocaleLowerCase()
          .localeCompare(right.name.toLocaleLowerCase()),
      ),
    [categories],
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Expense category"
      ariaLabel="Select expense category"
      zIndex="z-[85]"
    >
      <div className="grid max-h-[60vh] grid-cols-2 gap-[.5rem] overflow-y-auto">
        {sorted.map((item) => {
          const Icon = resolveCategoryIcon(item.id, item.name, item.icon);
          const selected = item.id === selectedId;
          return (
            <button
              aria-pressed={selected}
              className={categoryOptionClass(selected)}
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
              type="button"
            >
              <Icon aria-hidden="true" size={17} className="shrink-0 text-primary-600" />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {selected ? (
                <Check aria-hidden="true" className="shrink-0" size={16} />
              ) : null}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export function BudgetOptionSheet({
  open,
  onClose,
  title,
  ariaLabel,
  options,
  selectedValue,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  ariaLabel: string;
  options: Array<{ value: string; label: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      ariaLabel={ariaLabel}
      zIndex="z-[85]"
    >
      <div className="grid max-h-[60vh] gap-[.4rem] overflow-y-auto">
        {options.map((option) => {
          const selected = option.value === selectedValue;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "flex min-h-[2.7rem] w-full cursor-pointer items-center justify-between gap-[.6rem] rounded-[.7rem] border px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors",
                selected
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-border bg-surface hover:bg-surface-subtle",
              )}
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              type="button"
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {selected ? (
                <Check aria-hidden="true" className="shrink-0" size={18} />
              ) : null}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}