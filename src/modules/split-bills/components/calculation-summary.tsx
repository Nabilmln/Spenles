import { formatIdr } from "@/lib/money/format-idr";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import type { SplitBillCalculationResult } from "../types/split-bill";

export function CalculationSummary({
  result,
  authoritative = false,
}: {
  result: SplitBillCalculationResult;
  authoritative?: boolean;
}) {
  return (
    <aside className={`${cardClass} grid min-w-0 gap-4`} aria-label="Ringkasan perhitungan">
      <div>
        <p className={eyebrowClass}>
          {authoritative ? "Snapshot final" : "Pratinjau lokal"}
        </p>
        <h2 className="m-0">Ringkasan tagihan</h2>
      </div>
      <dl className="m-0 grid gap-[.55rem]">
        <div className="flex justify-between gap-4"><dt className="text-muted">Subtotal</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(result.subtotalAmount)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Diskon</dt><dd className="m-0 font-medium text-right wrap-anywhere">-{formatIdr(result.discountAmount)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Pajak item</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(result.itemTaxAmount)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Pajak tagihan</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(result.billTaxAmount)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Biaya layanan</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(result.serviceChargeAmount)}</dd></div>
        <div className="mt-[.35rem] flex justify-between gap-4 border-t border-border pt-[.75rem] text-[1.08rem]">
          <dt className="text-muted">Total akhir</dt><dd className="m-0 font-medium text-right wrap-anywhere">{formatIdr(result.finalAmount)}</dd>
        </div>
      </dl>
      <div className="grid gap-[.55rem] border-t border-border pt-[.9rem]">
        <h3 className="m-0 text-[.95rem]">Kewajiban peserta</h3>
        {result.participants.map((participant) => (
          <div key={participant.participantId} className="flex justify-between gap-4">
            <span>{participant.name}</span>
            <strong>{formatIdr(participant.finalAmount)}</strong>
          </div>
        ))}
      </div>
      {!authoritative ? (
        <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.76rem] text-muted">
          Pratinjau browser bukan nilai final. Server menghitung ulang sebelum
          penyimpanan dan finalisasi.
        </p>
      ) : null}
    </aside>
  );
}
