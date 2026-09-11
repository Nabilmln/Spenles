"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatIdr } from "@/lib/money/format-idr";
import type { SplitBillCalculationResult } from "../types/split-bill";
import {
  createShareSummaryAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";

function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  return succeeded
    ? Promise.resolve()
    : Promise.reject(new Error("Clipboard not available."));
}

export function MakeBillPreviewSheet({
  open,
  onClose,
  result,
  merchantName,
  billDate,
  finalizedId,
}: {
  open: boolean;
  onClose: () => void;
  result: SplitBillCalculationResult | null;
  merchantName: string;
  billDate: string;
  finalizedId: string | null;
}) {
  const [state, action, pending] = useActionState<
    SplitBillActionState,
    FormData
  >(createShareSummaryAction, {});
  const [copyStatus, setCopyStatus] = useState<"copied" | "failed" | "">("");
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state.text) return;
    copyToClipboard(state.text)
      .then(() => {
        setCopyStatus("copied");
        toast.success("Split Bill copied to clipboard.");
      })
      .catch(() => setCopyStatus("failed"));
  }, [state.text, toast]);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(""), 3000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  function goToResult() {
    if (!finalizedId) return;
    onClose();
    router.push(`/split-bills/${finalizedId}`);
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        onClose();
        if (finalizedId) router.push(`/split-bills/${finalizedId}`);
      }}
      title="Split Bill Preview"
      ariaLabel="Split bill preview"
    >
      <div className="grid gap-[1rem]">
        <div className="grid gap-[.35rem]">
          <p className="m-0 text-[.72rem] font-semibold uppercase tracking-[.14em] text-primary-600">
            Bill summary
          </p>
          <h3 className="m-0 text-[1.1rem] tracking-[-.02em]">{merchantName}</h3>
          <p className="m-0 text-[.8rem] text-muted">{billDate}</p>
        </div>

        {result ? (
          <dl className="m-0 grid gap-[.55rem] rounded-[.7rem] border border-border bg-surface-subtle p-[.8rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="m-0 font-medium wrap-anywhere">
                {formatIdr(result.subtotalAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Discount</dt>
              <dd className="m-0 font-medium wrap-anywhere">
                -{formatIdr(result.discountAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Tax</dt>
              <dd className="m-0 font-medium wrap-anywhere">
                {formatIdr(result.totalTaxAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Service charge</dt>
              <dd className="m-0 font-medium wrap-anywhere">
                {formatIdr(result.serviceChargeAmount)}
              </dd>
            </div>
            <div className="mt-[.35rem] flex justify-between gap-4 border-t border-border pt-[.7rem] text-[1.05rem]">
              <dt className="text-muted">Final total</dt>
              <dd className="m-0 font-semibold wrap-anywhere">
                {formatIdr(result.finalAmount)}
              </dd>
            </div>
          </dl>
        ) : null}

        {result && result.participants.length > 0 ? (
          <dl className="m-0 grid gap-[.4rem]">
            {result.participants.map((participant) => (
              <div
                key={participant.participantId}
                className="flex justify-between gap-4"
              >
                <dt className="min-w-0 truncate">{participant.name}</dt>
                <dd className="m-0 font-medium wrap-anywhere">
                  {formatIdr(participant.finalAmount)}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <form action={action} className="grid gap-[.65rem]">
          {finalizedId ? (
            <input type="hidden" name="id" value={finalizedId} />
          ) : null}
          <Button type="submit" variant="secondary" disabled={pending || !finalizedId}>
            {pending ? "Copying..." : "Copy to Clipboard"}
          </Button>
        </form>
        {copyStatus === "copied" ? (
          <p className="m-0 text-[.78rem] font-medium text-income" role="status">
            Split Bill copied to clipboard.
          </p>
        ) : null}
        {copyStatus === "failed" ? (
          <p className="m-0 text-[.78rem] font-medium text-expense" role="alert">
            Automatic copy failed.
          </p>
        ) : null}

        <Button type="button" onClick={goToResult} disabled={!finalizedId}>
          View Result
        </Button>
      </div>
    </BottomSheet>
  );
}