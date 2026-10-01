"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { actionSheetRowClass } from "@/components/ui/styles";

export function BudgetActionSheet({
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Budget Actions"
      ariaLabel="Budget actions"
      zIndex="z-[85]"
    >
      <div className="mb-6 grid gap-[.6rem]">
        <button type="button" className={actionSheetRowClass} onClick={onEdit}>
          <Pencil size={18} aria-hidden="true" className="shrink-0 text-primary-600" />
          <span className="block">Edit Budget</span>
        </button>
        <button type="button" className={actionSheetRowClass} onClick={onDelete}>
          <Trash2 size={18} aria-hidden="true" className="shrink-0 text-expense" />
          <span className="block">Delete Budget</span>
        </button>
      </div>
    </BottomSheet>
  );
}
