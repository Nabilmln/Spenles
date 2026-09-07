"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  editTransactionFromHistoryAction,
  getTransactionForEditAction,
  getTransactionOptionsAction,
} from "../actions/transaction-actions";
import { TransactionForm, type TransactionFormCategory } from "./transaction-form";

type Options = {
  accounts: { id: string; name: string; type: string }[];
  categories: TransactionFormCategory[];
};

export function EditTransactionSheet({
  transactionId,
  open,
  onClose,
  onSaved,
}: {
  transactionId: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [options, setOptions] = useState<Options | null>(null);
  const [initial, setInitial] = useState<{
    id: string;
    type: "income" | "expense";
    amount: string;
    accountId: string;
    categoryId: string;
    transactionAt: string;
    note: string;
  } | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setInitial(null);
      setOptions(null);
    }
  }

  useEffect(() => {
    if (open && transactionId) {
      getTransactionOptionsAction().then(setOptions);
      getTransactionForEditAction(transactionId).then(setInitial);
    }
  }, [open, transactionId]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Edit Transaction"
      ariaLabel="Edit transaction"
      zIndex="z-[85]"
    >
      {options && initial ? (
        <TransactionForm
          key={initial.id}
          action={async (state, data) => {
            const result = await editTransactionFromHistoryAction(state, data);
            if (result.success) {
              onClose();
              onSaved?.();
            }
            return result;
          }}
          accounts={options.accounts}
          categories={options.categories}
          initial={initial}
        />
      ) : (
        <div className="grid gap-[.75rem]">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              aria-hidden="true"
              className="h-[2.9rem] animate-pulse rounded-[.72rem] bg-surface-subtle"
              key={index}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
