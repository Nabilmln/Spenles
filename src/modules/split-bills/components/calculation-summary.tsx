import { formatIdr } from "@/lib/money/format-idr";
import type { SplitBillCalculationResult } from "../types/split-bill";

export function CalculationSummary({
  result,
  authoritative = false,
}: {
  result: SplitBillCalculationResult;
  authoritative?: boolean;
}) {
  return (
    <aside className="card split-summary" aria-label="Ringkasan perhitungan">
      <div>
        <p className="eyebrow">
          {authoritative ? "Snapshot final" : "Pratinjau lokal"}
        </p>
        <h2>Ringkasan tagihan</h2>
      </div>
      <dl className="split-totals">
        <div><dt>Subtotal</dt><dd>{formatIdr(result.subtotalAmount)}</dd></div>
        <div><dt>Diskon</dt><dd>-{formatIdr(result.discountAmount)}</dd></div>
        <div><dt>Pajak item</dt><dd>{formatIdr(result.itemTaxAmount)}</dd></div>
        <div><dt>Pajak tagihan</dt><dd>{formatIdr(result.billTaxAmount)}</dd></div>
        <div><dt>Biaya layanan</dt><dd>{formatIdr(result.serviceChargeAmount)}</dd></div>
        <div className="split-final-total">
          <dt>Total akhir</dt><dd>{formatIdr(result.finalAmount)}</dd>
        </div>
      </dl>
      <div className="split-participant-preview">
        <h3>Kewajiban peserta</h3>
        {result.participants.map((participant) => (
          <div key={participant.participantId}>
            <span>{participant.name}</span>
            <strong>{formatIdr(participant.finalAmount)}</strong>
          </div>
        ))}
      </div>
      {!authoritative ? (
        <p className="financial-disclaimer">
          Pratinjau browser bukan nilai final. Server menghitung ulang sebelum
          penyimpanan dan finalisasi.
        </p>
      ) : null}
    </aside>
  );
}
