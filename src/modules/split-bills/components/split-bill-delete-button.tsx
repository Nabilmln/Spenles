"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iconButtonClass } from "@/components/ui/styles";
import { deleteSplitBillAction } from "../actions/split-bill-actions";

export function SplitBillDeleteButton({
  billId,
  label,
}: {
  billId: string;
  label: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-[.78rem] text-muted">Hapus tagihan ini?</span>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConfirming(false)}
        >
          Batal
        </Button>
        <form action={deleteSplitBillAction}>
          <input type="hidden" name="id" value={billId} />
          <Button type="submit" variant="danger">Hapus</Button>
        </form>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={iconButtonClass}
      aria-label={`Hapus ${label}`}
      onClick={() => setConfirming(true)}
    >
      <Trash2 size={17} aria-hidden="true" />
    </button>
  );
}
