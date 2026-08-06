import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";
import { formatIdr } from "@/lib/money/format-idr";

export function TransactionSummary({
  income,
  expense,
  savings,
}: {
  income: bigint;
  expense: bigint;
  savings: bigint;
}) {
  return (
    <section aria-label="Ringkasan periode" className="tx-summary card">
      <div className="tx-summary-section tx-summary-income">
        <ArrowDownLeft aria-hidden="true" className="tx-summary-icon" />
        <strong className="tx-summary-value">+ {formatIdr(income)}</strong>
        <span className="tx-summary-label">Pendapatan</span>
      </div>
      <div className="tx-summary-section tx-summary-expense">
        <ArrowUpRight aria-hidden="true" className="tx-summary-icon" />
        <strong className="tx-summary-value">− {formatIdr(expense)}</strong>
        <span className="tx-summary-label">Pengeluaran</span>
      </div>
      <div className="tx-summary-section tx-summary-savings">
        <PiggyBank aria-hidden="true" className="tx-summary-icon" />
        <strong className="tx-summary-value">
          {savings < 0n ? "− " : ""}
          {formatIdr(savings < 0n ? -savings : savings)}
        </strong>
        <span className="tx-summary-label">Tabungan</span>
      </div>
    </section>
  );
}
