"use client";

import { Eye, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const actionRowClass =
  "flex w-full min-h-[3rem] cursor-pointer items-center gap-[.75rem] rounded-[.8rem] border border-border bg-surface-subtle px-[.9rem] text-left text-[.9rem] font-medium transition-colors";

export function SplitBillActionSheet({
  open,
  onClose,
  onViewResult,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  onViewResult: () => void;
  onDelete: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Split Bill Actions"
      ariaLabel="Split bill actions"
      zIndex="z-[85]"
    >
      <div className="mb-6 grid gap-[.6rem]">
        <button type="button" className={actionRowClass} onClick={onViewResult}>
          <Eye
            size={18}
            aria-hidden="true"
            className="shrink-0 text-primary-600"
          />
          <span>View Result</span>
        </button>
        <button type="button" className={actionRowClass} onClick={onDelete}>
          <Trash2
            size={18}
            aria-hidden="true"
            className="shrink-0 text-expense"
          />
          <span>Delete Split Bill</span>
        </button>
      </div>
    </BottomSheet>
  );
}