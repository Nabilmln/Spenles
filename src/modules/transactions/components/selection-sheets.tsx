"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";

export type CategorySelectionItem = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export function CategorySelectionSheet({
  open,
  onClose,
  categories,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategorySelectionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const sorted = [...categories].sort((left, right) =>
    left.name.toLocaleLowerCase().localeCompare(right.name.toLocaleLowerCase()),
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select Category"
      ariaLabel="Select category"
      zIndex="z-[85]"
    >
      <div className="grid max-h-[60vh] grid-cols-2 gap-[.5rem] overflow-y-auto">
        {sorted.map((item) => {
          const Icon = resolveCategoryIcon(item.id, item.name, item.icon);
          const selected = item.id === selectedId;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "flex min-h-[3rem] cursor-pointer items-center gap-[.55rem] rounded-[.7rem] border px-[.65rem] py-[.55rem] text-left text-[.82rem] font-medium text-foreground transition-colors",
                selected
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-border bg-surface hover:bg-surface-subtle",
              )}
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

export function AccountSelectionSheet({
  open,
  onClose,
  accounts,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  accounts: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select Account"
      ariaLabel="Select account"
      zIndex="z-[85]"
    >
      <div className="grid max-h-[60vh] gap-[.4rem] overflow-y-auto">
        {accounts.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "flex min-h-[2.7rem] w-full cursor-pointer items-center justify-between gap-[.6rem] rounded-[.7rem] border px-[.75rem] py-[.55rem] text-left text-[.9rem] font-medium text-foreground transition-colors",
                selected
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-border bg-surface hover:bg-surface-subtle",
              )}
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
              type="button"
            >
              <span className="min-w-0 truncate">{item.name}</span>
              {selected ? <Check aria-hidden="true" size={18} /> : null}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}