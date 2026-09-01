"use client";

import { useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { formatDayDateLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import {
  archiveSplitBillAction,
  deleteSplitBillAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { PaymentStatusForm } from "./payment-status-form";
import { ShareSummaryButton } from "./share-summary-button";

const statusLabel = {
  finalized: "Final",
  archived: "Archived",
} as const;

const statusBadgeClass = {
  finalized: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  archived: "text-muted bg-surface-subtle",
};

export type SplitBillDetailData = {
  id: string;
  merchantName: string;
  billDate: string;
  note: string | null;
  status: "finalized" | "archived";
  calculationVersion: number;
  subtotalAmount: string;
  discountAmount: string;
  itemTaxAmount: string;
  billTaxAmount: string;
  serviceChargeAmount: string;
  finalAmount: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: string;
    discountAmount: string;
    discountedAmount: string;
    itemTaxAmount: string;
    billTaxAmount: string;
  }[];
  participants: {
    id: string;
    name: string;
    itemAmount: string;
    itemTaxAmount: string;
    billTaxAmount: string;
    serviceChargeAmount: string;
    finalAmount: string;
    paymentStatus: "unpaid" | "partially_paid" | "paid";
    paidAmount: string;
  }[];
};

export function SplitBillDetail({ detail }: { detail: SplitBillDetailData }) {
  const [, archiveAction, pending] = useToastActionState<
    SplitBillActionState,
    FormData
  >(archiveSplitBillAction, {});
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(19rem,.55fr)] items-start gap-4 max-[900px]:grid-cols-1">
      <section className="grid min-w-0 gap-4">
        <article className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="m-0 text-[.78rem] font-medium text-muted">
                {formatDayDateLong(detail.billDate)}
              </p>
              <h2 className="m-0 text-[1.25rem] tracking-[-.02em]">{detail.merchantName}</h2>
            </div>
            <span className={`inline-flex min-h-[1.8rem] items-center rounded-full px-[.55rem] py-[.25rem] whitespace-nowrap text-[.72rem] font-medium ${statusBadgeClass[detail.status]}`}>
              {statusLabel[detail.status]}
            </span>
          </div>
          {detail.note ? <p>{detail.note}</p> : null}
          <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.76rem] text-muted">
            Calculation snapshot version {detail.calculationVersion}. Final
            results are not recalculated when application rules change.
          </p>
        </article>

        <section className={cardClass}>
          <h2 className="m-0">Items</h2>
          <div className="grid gap-[.8rem]">
            {detail.items.map((item) => (
              <article key={item.id} className="grid grid-cols-[minmax(0,1fr)_minmax(13rem,auto)] gap-4 border-b border-border p-[.85rem_0] last:border-0 max-[540px]:grid-cols-1">
                <div className="grid gap-[.2rem]">
                  <strong>{item.name}</strong>
                  <small className="text-muted">
                    {item.quantity} × {formatIdr(item.unitPrice)}
                  </small>
                </div>
                <dl className="m-0 grid gap-[.25rem]">
                  <div className="flex justify-between gap-4"><dt className="text-[.75rem] text-muted">After discount</dt><dd className="m-0 font-medium">{formatIdr(item.discountedAmount)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[.75rem] text-muted">Tax</dt><dd className="m-0 font-medium">{formatIdr(BigInt(item.itemTaxAmount) + BigInt(item.billTaxAmount))}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="m-0">Participant obligations</h2>
          <div className="grid gap-[.8rem]">
            {detail.participants.map((participant) => (
              <article className="grid gap-[.85rem] rounded-[.8rem] border border-border bg-surface-subtle p-4" key={participant.id}>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="m-0 text-[.95rem]">{participant.name}</h3>
                  <strong>{formatIdr(participant.finalAmount)}</strong>
                </div>
                <dl className="m-0 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-[.55rem] max-[540px]:grid-cols-1">
                  <div className="grid gap-[.15rem]"><dt className="text-muted">Item</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(participant.itemAmount)}</dd></div>
                  <div className="grid gap-[.15rem]"><dt className="text-muted">Tax</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(BigInt(participant.itemTaxAmount) + BigInt(participant.billTaxAmount))}</dd></div>
                  <div className="grid gap-[.15rem]"><dt className="text-muted">Service</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(participant.serviceChargeAmount)}</dd></div>
                </dl>
                {detail.status === "finalized" ? (
                  <PaymentStatusForm
                    billId={detail.id}
                    participantId={participant.id}
                    obligation={participant.finalAmount}
                    initialStatus={participant.paymentStatus}
                    initialPaidAmount={participant.paidAmount}
                  />
                ) : (
                  <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.76rem] text-muted">
                    Payment status is frozen after archiving.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="grid min-w-0 gap-4">
        <article className={`${cardClass} grid min-w-0 gap-4`}>
          <p className={eyebrowClass}>Final snapshot</p>
          <h2 className="m-0">Summary</h2>
          <dl className="m-0 grid gap-[.55rem]">
            <div className="flex justify-between gap-4"><dt className="text-muted">Subtotal</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(detail.subtotalAmount)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Discount</dt><dd className="m-0 font-medium text-right wrap-anywhere">-{formatIdr(detail.discountAmount)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Item tax</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(detail.itemTaxAmount)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Bill tax</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(detail.billTaxAmount)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Service charge</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(detail.serviceChargeAmount)}</dd></div>
            <div className="mt-[.35rem] flex justify-between gap-4 border-t border-border pt-[.75rem] text-[1.08rem]"><dt className="text-muted">Total</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(detail.finalAmount)}</dd></div>
          </dl>
        </article>
        <article className={cardClass}>
          <h2 className="m-0">Share</h2>
          <p>The summary stays private and does not create a public link.</p>
          <ShareSummaryButton billId={detail.id} />
        </article>
        {detail.status === "finalized" ? (
          <article className={cardClass}>
            <h2 className="m-0">Archive</h2>
            <p>Archiving keeps the snapshot and freezes payment status.</p>
            <form action={archiveAction} className="mt-[.75rem] grid gap-[.6rem]">
              <input type="hidden" name="id" value={detail.id} />
              <Button type="submit" variant="secondary" disabled={pending} className="w-full">
                {pending ? "Archiving..." : "Archive bill"}
              </Button>
            </form>
          </article>
        ) : null}
        {detail.status === "finalized" || detail.status === "archived" ? (
          <article className={cardClass}>
            <h2 className="m-0">Delete</h2>
            <p>Permanently deleting a bill removes all items and payment history.</p>
            {confirmDelete ? (
              <div className="mt-[.75rem] grid gap-[.7rem]">
                <p role="alert" className="m-0 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.76rem] text-muted">Are you sure? This action is permanent and cannot be undone.</p>
                <div className="grid grid-cols-2 gap-[.6rem]">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setConfirmDelete(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <form action={deleteSplitBillAction}>
                    <input type="hidden" name="id" value={detail.id} />
                    <Button type="submit" variant="danger" className="w-full">Delete permanently</Button>
                  </form>
                </div>
              </div>
            ) : (
              <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)} className="mt-[.75rem] w-full">
                Delete bill
              </Button>
            )}
          </article>
        ) : null}
      </aside>
    </div>
  );
}
