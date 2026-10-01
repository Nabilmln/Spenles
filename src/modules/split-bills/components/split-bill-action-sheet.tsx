"use client";

import { Eye, PencilLine, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { actionSheetRowClass } from "@/components/ui/styles";

export function SplitBillActionSheet({
  open,
  onClose,
  status,
  onViewResult,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  status: "draft" | "finalized";
  onViewResult: () => void;
  onEdit: () => void;
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
        {status === "finalized" ? (
          <button type="button" className={actionSheetRowClass} onClick={onViewResult}>
            <Eye
              size={18}
              aria-hidden="true"
              className="shrink-0 text-primary-600"
            />
            <span>View Result</span>
          </button>
        ) : (
          <button type="button" className={actionSheetRowClass} onClick={onEdit}>
            <PencilLine
              size={18}
              aria-hidden="true"
              className="shrink-0 text-primary-600"
            />
            <span>Edit Split Bill</span>
          </button>
        )}
        <button type="button" className={actionSheetRowClass} onClick={onDelete}>
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
