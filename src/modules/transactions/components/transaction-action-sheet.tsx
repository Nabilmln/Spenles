"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { actionSheetRowClass } from "@/components/ui/styles";

export function TransactionActionSheet({
  open,
  onClose,
  canEdit,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Transaction Actions"
      ariaLabel="Transaction actions"
      zIndex="z-[85]"
    >
      <div className="grid gap-[.6rem] mb-6">
        {canEdit ? (
          <button type="button" className={actionSheetRowClass} onClick={onEdit}>
            <Pencil size={18} aria-hidden="true" className="shrink-0 text-primary-600" />
            <span>
              <span className="block">Edit Transaction</span>
              {/* <span className="block text-[.72rem] font-normal text-muted">Change amount, category, account, or date</span> */}
            </span>
          </button>
        ) : null}
        <button type="button" className={actionSheetRowClass} onClick={onDelete}>
          <Trash2 size={18} aria-hidden="true" className="shrink-0 text-expense" />
          <span>
            <span className="block">Delete Transaction</span>
            {/* <span className="block text-[.72rem] font-normal text-muted">Remove this transaction</span> */}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
}
