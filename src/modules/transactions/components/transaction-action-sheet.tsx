"use client";

import { Pencil, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const actionRowClass =
  "flex w-full min-h-[3rem] cursor-pointer items-center gap-[.75rem] rounded-[.8rem] border border-border bg-surface-subtle px-[.9rem] text-left text-[.9rem] font-medium transition-colors";

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
          <button type="button" className={actionRowClass} onClick={onEdit}>
            <Pencil size={18} aria-hidden="true" className="shrink-0 text-primary-600" />
            <span>
              <span className="block">Edit Transaction</span>
              {/* <span className="block text-[.72rem] font-normal text-muted">Change amount, category, account, or date</span> */}
            </span>
          </button>
        ) : null}
        <button type="button" className={actionRowClass} onClick={onDelete}>
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
