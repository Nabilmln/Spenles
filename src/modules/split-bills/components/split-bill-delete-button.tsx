"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="split-row-delete-confirm">
        <span className="muted">Hapus tagihan ini?</span>
        <div className="split-delete-actions">
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
      </div>
    );
  }

  return (
    <div className="split-row-delete">
      <button
        type="button"
        className="icon-button"
        aria-label={`Hapus ${label}`}
        onClick={() => setConfirming(true)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
