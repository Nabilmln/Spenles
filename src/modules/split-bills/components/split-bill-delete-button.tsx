"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
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

  return (
    <>
      <button
        type="button"
        className={iconButtonClass}
        aria-label={`Hapus ${label}`}
        onClick={() => setConfirming(true)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>

      {confirming ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-[rgb(15_17_21/55%)] p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            aria-labelledby="delete-bill-title"
            aria-modal="true"
            className="w-full max-w-[24rem] rounded-[1.1rem] border border-border bg-surface p-[1.25rem] shadow-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="delete-bill-title" className="m-0 text-[1.08rem]">
                Hapus tagihan?
              </h2>
              <button
                type="button"
                className={iconButtonClass}
                aria-label="Tutup konfirmasi"
                onClick={() => setConfirming(false)}
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <p className="m-0 text-[.9rem] text-muted">
              Tagihan &ldquo;{label}&rdquo; akan dihapus permanen dan tidak
              dapat dipulihkan.
            </p>
            <div className="mt-[1.1rem] grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirming(false)}
              >
                Batal
              </Button>
              <form action={deleteSplitBillAction}>
                <input type="hidden" name="id" value={billId} />
                <Button type="submit" variant="danger" className="w-full">
                  Hapus
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}