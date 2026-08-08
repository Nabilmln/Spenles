"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { formatIdr } from "@/lib/money/format-idr";
import {
  archiveSplitBillAction,
  deleteSplitBillAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";
import { PaymentStatusForm } from "./payment-status-form";
import { ShareSummaryButton } from "./share-summary-button";

const statusLabel = {
  finalized: "Final",
  archived: "Diarsipkan",
} as const;

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
  const [archiveState, archiveAction, pending] = useActionState<
    SplitBillActionState,
    FormData
  >(archiveSplitBillAction, {});
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="split-detail-layout">
      <section className="split-detail-main">
        <article className="card">
          <div className="domain-card-heading">
            <div>
              <p className="eyebrow">{detail.billDate}</p>
              <h2 className="entity-heading">{detail.merchantName}</h2>
            </div>
            <span className={`status-badge split-status-${detail.status}`}>
              {statusLabel[detail.status]}
            </span>
          </div>
          {detail.note ? <p>{detail.note}</p> : null}
          <p className="financial-disclaimer">
            Snapshot kalkulasi versi {detail.calculationVersion}. Hasil final
            tidak dihitung ulang ketika aturan aplikasi berubah.
          </p>
        </article>

        <section className="card">
          <h2>Item</h2>
          <div className="split-result-list">
            {detail.items.map((item) => (
              <article key={item.id} className="split-result-row">
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {item.quantity} × {formatIdr(item.unitPrice)}
                  </small>
                </div>
                <dl>
                  <div><dt>Setelah diskon</dt><dd>{formatIdr(item.discountedAmount)}</dd></div>
                  <div><dt>Pajak</dt><dd>{formatIdr(BigInt(item.itemTaxAmount) + BigInt(item.billTaxAmount))}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Kewajiban peserta</h2>
          <div className="split-participant-results">
            {detail.participants.map((participant) => (
              <article className="split-participant-card" key={participant.id}>
                <div className="domain-card-heading">
                  <h3>{participant.name}</h3>
                  <strong>{formatIdr(participant.finalAmount)}</strong>
                </div>
                <dl className="split-totals compact">
                  <div><dt>Item</dt><dd>{formatIdr(participant.itemAmount)}</dd></div>
                  <div><dt>Pajak</dt><dd>{formatIdr(BigInt(participant.itemTaxAmount) + BigInt(participant.billTaxAmount))}</dd></div>
                  <div><dt>Layanan</dt><dd>{formatIdr(participant.serviceChargeAmount)}</dd></div>
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
                  <p className="financial-disclaimer">
                    Status pembayaran dibekukan setelah arsip.
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="split-detail-aside">
        <article className="card split-summary">
          <p className="eyebrow">Snapshot final</p>
          <h2>Ringkasan</h2>
          <dl className="split-totals">
            <div><dt>Subtotal</dt><dd>{formatIdr(detail.subtotalAmount)}</dd></div>
            <div><dt>Diskon</dt><dd>-{formatIdr(detail.discountAmount)}</dd></div>
            <div><dt>Pajak item</dt><dd>{formatIdr(detail.itemTaxAmount)}</dd></div>
            <div><dt>Pajak tagihan</dt><dd>{formatIdr(detail.billTaxAmount)}</dd></div>
            <div><dt>Biaya layanan</dt><dd>{formatIdr(detail.serviceChargeAmount)}</dd></div>
            <div className="split-final-total"><dt>Total</dt><dd>{formatIdr(detail.finalAmount)}</dd></div>
          </dl>
        </article>
        <article className="card">
          <h2>Bagikan</h2>
          <p>Ringkasan tetap privat dan tidak membuat tautan publik.</p>
          <ShareSummaryButton billId={detail.id} />
        </article>
        {detail.status === "finalized" ? (
          <article className="card">
            <h2>Arsip</h2>
            <p>Arsip mempertahankan snapshot dan membekukan status pembayaran.</p>
            <form action={archiveAction}>
              <input type="hidden" name="id" value={detail.id} />
              <Button type="submit" variant="ghost" disabled={pending}>
                {pending ? "Mengarsipkan..." : "Arsipkan tagihan"}
              </Button>
              <FormMessage>{archiveState.error}</FormMessage>
              {archiveState.success ? <p role="status">{archiveState.success}</p> : null}
            </form>
          </article>
        ) : null}
        {detail.status === "finalized" || detail.status === "archived" ? (
          <article className="card">
            <h2>Hapus</h2>
            <p>Menghapus tagihan permanen menghilangkan seluruh item dan riwayat pembayaran.</p>
            {confirmDelete ? (
              <div className="split-delete-confirm">
                <p role="alert" className="financial-disclaimer">Yakin? Tindakan ini permanen dan tidak dapat dibatalkan.</p>
                <div className="split-delete-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Batal
                  </Button>
                  <form action={deleteSplitBillAction}>
                    <input type="hidden" name="id" value={detail.id} />
                    <Button type="submit" variant="danger">Hapus permanen</Button>
                  </form>
                </div>
              </div>
            ) : (
              <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
                Hapus tagihan
              </Button>
            )}
          </article>
        ) : null}
      </aside>
    </div>
  );
}
