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
        className="grid min-h-[2.9rem] min-w-[2.9rem] cursor-pointer place-items-center self-center rounded-full border-0 bg-transparent p-0"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="grid size-[2.2rem] place-items-center rounded-full bg-primary-600 text-white shadow-[0_6px_20px_rgb(79_70_229/45%)] transition-transform duration-150 active:scale-95">
          <Plus size={18} strokeWidth={2.75} aria-hidden="true" />
        </span>
      </button>
      <AddTransactionSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}