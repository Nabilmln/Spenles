"use client";

import { useState } from "react";
import { AddTransactionSheet } from "@/modules/transactions/components/add-transaction-sheet";

export function RecordExpenseButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mx-auto mt-[.6rem] inline-flex items-center text-[.78rem] font-medium text-primary-600 hover:text-primary-700"
        onClick={() => setOpen(true)}
      >
        Record expense
      </button>
      <AddTransactionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
