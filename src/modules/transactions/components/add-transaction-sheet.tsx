"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { formatJakartaDate } from "@/lib/dates/jakarta";
import { createTransactionAction, getTransactionOptionsAction } from "../actions/transaction-actions";
import { TransactionForm, type TransactionFormCategory } from "./transaction-form";

type Options = {
  accounts: { id: string; name: string; type: string }[];
  categories: TransactionFormCategory[];
};

export function AddTransactionSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<Options | null>(null);

  useEffect(() => {
    if (open && !options) {
      getTransactionOptionsAction().then(setOptions);
    }
  }, [open, options]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add Transaction"
      ariaLabel="Add transaction"
    >
      {options ? (
        <TransactionForm
          action={createTransactionAction}
          accounts={options.accounts}
          categories={options.categories}
          defaultDate={formatJakartaDate(new Date())}
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