"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import type { FriendRow } from "@/modules/friends";
import type { SplitBillCalculationResult } from "../types/split-bill";
import { BillAmountSummary } from "./bill-amount-summary";

export type MakeBillOverviewItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  participantIds: string[];
};

export function MakeBillOverviewSheet({
  open,
  onClose,
  preview,
  merchantName,
  billDate,
  participants,
  items,
  note,
  onSaveDraft,
  saving,
  onConfirm,
  finalizing,
}: {
  open: boolean;
  onClose: () => void;
  preview: SplitBillCalculationResult | null;
  merchantName: string;
  billDate: string;
  participants: FriendRow[];
  items: MakeBillOverviewItem[];
  note: string;
  onSaveDraft: () => void;
  saving: boolean;
  onConfirm: () => void;
  finalizing: boolean;
}) {
  const nameById = new Map(
    participants.map((participant) => [participant.id, participant.name]),
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="Overview" ariaLabel="Overview">
      <div className="grid gap-[1.1rem]">
        <div className="grid gap-[.35rem]">
          <h3 className="m-0 min-w-0 text-[1.1rem] tracking-[-.02em] wrap-anywhere">
            {merchantName || "Untitled bill"}
          </h3>
          <p className="m-0 text-[.8rem] text-muted">{billDate}</p>
        </div>

        {participants.length > 0 ? (
          <div className="grid gap-[.4rem]">
            <p className={`${eyebrowClass} m-0`}>Participants</p>
            <div className="flex flex-wrap gap-[.4rem]">
              {participants.map((participant) => (
                <span
                  key={participant.id}
                  className="rounded-full border border-border bg-surface-subtle px-[.6rem] py-[.25rem] text-[.8rem] font-medium"
                >
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="grid gap-[.5rem]">
            <p className={`${eyebrowClass} m-0`}>Items</p>
            {items.map((item) => {
              const total =
                item.quantity > 0 && item.unitPrice
                  ? (BigInt(item.quantity) * BigInt(item.unitPrice)).toString()
                  : "";
              const assignees = item.participantIds
                .map((id) => nameById.get(id))
                .filter((name): name is string => Boolean(name));
              return (
                <div
                  key={item.id}
                  data-testid={`overview-item-${item.id}`}
                  className="rounded-[.7rem] border border-border bg-surface-subtle p-[.8rem]"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0 truncate font-medium">
                      {item.name || "Unnamed item"}
                    </span>
                    {total ? (
                      <span className="wrap-anywhere text-[.85rem]">
                        {formatIdr(total)}
                      </span>
                    ) : null}
                  </div>
                  <p className="m-0 mt-[.3rem] min-w-0 text-[.78rem] text-muted wrap-anywhere">
                    {assignees.length
                      ? assignees.join(", ")
                      : "No participants"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {preview ? (
          <BillAmountSummary
            amounts={{
              subtotal: preview.subtotalAmount.toString(),
              discount: preview.discountAmount.toString(),
              itemTax: preview.itemTaxAmount.toString(),
              billTax: preview.billTaxAmount.toString(),
              serviceCharge: preview.serviceChargeAmount.toString(),
              total: preview.finalAmount.toString(),
            }}
          />
        ) : null}

        {note ? (
          <p className="m-0 min-w-0 text-[.82rem] text-muted wrap-anywhere">
            {note}
          </p>
        ) : null}

        <div className="grid gap-[.6rem] border-t border-border pt-[1rem]">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={saving}
              onClick={onSaveDraft}
            >
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={finalizing || !preview}
              onClick={onConfirm}
            >
              {finalizing ? "Finalizing..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}