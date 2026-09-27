"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddTransactionSheet } from "@/modules/transactions/components/add-transaction-sheet";

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Add transaction"
        className="grid min-h-[2.9rem] min-w-[2.9rem] cursor-pointer place-items-center self-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="grid size-[2.2rem] place-items-center rounded-full bg-white text-primary-700 transition-transform duration-150 active:scale-95">
          <Plus size={18} strokeWidth={2.75} aria-hidden="true" />
        </span>
      </button>
      <AddTransactionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
