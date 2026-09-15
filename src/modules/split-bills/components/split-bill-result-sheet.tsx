"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { eyebrowClass } from "@/components/ui/styles";
import { useToast } from "@/components/ui/toast";
import { formatLongDateUtc } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import type { SplitBillResultData } from "../types/split-bill";
import {
  createShareSummaryAction,
  deleteSplitBillByIdAction,
} from "../actions/split-bill-actions";
import { BillAmountSummary } from "./bill-amount-summary";

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

export function SplitBillResultSheet({
  open,
  onClose,
  result,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  result: SplitBillResultData | null;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [copying, setCopying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nameById = new Map(
    (result?.participants ?? []).map((participant) => [
      participant.id,
      participant.name,
    ]),
  );

  async function handleCopy() {
    if (!result) return;
    setCopying(true);
    try {
      const formData = new FormData();
      formData.set("id", result.id);
      const state = await createShareSummaryAction({}, formData);
      if (!state.text) {
        toast.error(state.error ?? "Summary is not available yet.");
        return;
      }
      await copyToClipboard(state.text);
      toast.success("Split Bill copied to clipboard.");
    } catch {
      toast.error("Copy failed. Please try again.");
    } finally {
      setCopying(false);
    }
  }

  async function handleDelete() {
    if (!result) return;
    setDeleting(true);
    const outcome = await deleteSplitBillByIdAction(result.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (outcome.ok) {
      toast.success("Split bill deleted.");
      onClose();
      onDeleted();
    } else {
      toast.error("Split bill could not be deleted.");
    }
  }

  const footer = (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="secondary"
        className="min-w-0 flex-1"
        disabled={copying}
        onClick={handleCopy}
      >
        <Copy size={16} aria-hidden="true" />
        {copying ? "Copying..." : "Copy to Clipboard"}
      </Button>
      <Button
        type="button"
        variant="danger"
        className="shrink-0"
        disabled={deleting}
        onClick={() => setConfirmDelete(true)}
      >
        <Trash2 size={16} aria-hidden="true" />
        Delete
      </Button>
    </div>
  );

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Split Bill Result"
        ariaLabel="Split bill result"
        footer={footer}
      >
        {result ? (
          <div className="grid gap-[1.1rem]">
            <div className="grid gap-[.35rem]">
              <div className="flex items-center justify-between gap-4">
                <h3 className="m-0 min-w-0 truncate text-[1.1rem] tracking-[-.02em]">
                  {result.merchantName}
                </h3>
                <span className="shrink-0 inline-flex min-h-[1.6rem] items-center rounded-full bg-[color-mix(in_srgb,var(--income)_10%,transparent)] px-[.55rem] py-[.2rem] whitespace-nowrap text-[.68rem] font-semibold text-income">
                  {result.status === "finalized" ? "FINAL" : "DRAFT"}
                </span>
              </div>
              <p className="m-0 text-[.78rem] text-muted">
                {formatLongDateUtc(result.billDate)}
              </p>
            </div>

            {result.participants.length > 0 ? (
              <div className="grid gap-[.45rem]">
                <p className={`${eyebrowClass} m-0`}>Breakdown</p>
                <div className="grid gap-[.45rem]">
                  {result.participants.map((participant) => {
                    const parts = [
                      participant.itemAmount !== "0"
                        ? `Item ${formatIdr(participant.itemAmount)}`
                        : null,
                      participant.itemTaxAmount !== "0" ||
                      participant.billTaxAmount !== "0"
                        ? `Tax ${formatIdr(
                            (
                              BigInt(participant.itemTaxAmount) +
                              BigInt(participant.billTaxAmount)
                            ).toString(),
                          )}`
                        : null,
                      participant.serviceChargeAmount !== "0"
                        ? `Service ${formatIdr(
                            participant.serviceChargeAmount,
                          )}`
                        : null,
                    ].filter((part): part is string => Boolean(part));
                    return (
                      <div
                        key={participant.id}
                        data-testid={`participant-breakdown-${participant.id}`}
                        className="grid min-w-0 gap-[.4rem] rounded-[.7rem] border border-border bg-surface-subtle p-[.8rem]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="min-w-0 truncate rounded-full border border-border bg-surface px-[.6rem] py-[.25rem] text-[.8rem] font-medium">
                            {participant.name}
                          </span>
                          <span className="shrink-0 font-semibold wrap-anywhere">
                            {formatIdr(participant.finalAmount)}
                          </span>
                        </div>
                        {parts.length > 0 ? (
                          <p className="m-0 min-w-0 text-[.74rem] text-muted wrap-anywhere">
                            {parts.join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {result.items.length > 0 ? (
              <div className="grid gap-[.5rem]">
                <p className={`${eyebrowClass} m-0`}>Items</p>
                {result.items.map((item) => {
                  const total = (
                    BigInt(item.quantity) * BigInt(item.unitPrice || "0")
                  ).toString();
                  const assignees = item.participantIds
                    .map((id) => nameById.get(id))
                    .filter((name): name is string => Boolean(name));
                  return (
                    <div
                      key={item.id}
                      data-testid={`result-item-${item.id}`}
                      className="grid min-w-0 gap-[.15rem] rounded-[.7rem] border border-border bg-surface-subtle p-[.75rem]"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="min-w-0 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-[.85rem] wrap-anywhere">
                          {formatIdr(total)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="min-w-0 truncate text-[.74rem] text-muted">
                          {item.quantity} × {formatIdr(item.unitPrice)}
                        </span>
                        <span className="min-w-0 shrink-0 truncate pl-3 text-[.74rem] text-muted">
                          {assignees.length ? assignees.join(", ") : "\u2014"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <BillAmountSummary
                amounts={{
                  subtotal: result.subtotalAmount,
                  discount: result.discountAmount,
                  itemTax: result.itemTaxAmount,
                  billTax: result.billTaxAmount,
                  serviceCharge: result.serviceChargeAmount,
                  total: result.finalAmount,
                }}
              />

            {result.note ? (
              <p className="m-0 min-w-0 text-[.82rem] text-muted wrap-anywhere">
                {result.note}
              </p>
            ) : null}
          </div>
        ) : null}
      </BottomSheet>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Split Bill?"
        message="This Split Bill and its related data will be permanently deleted."
        confirmLabel="Delete Split Bill"
        pending={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}