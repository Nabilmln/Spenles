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
    <section aria-label="Ringkasan periode" className="summary-grid">
      <div className="summary-card card summary-income">
        <div className="summary-card-heading">
          <span className="summary-icon">
            <ArrowDownLeft aria-hidden="true" />
          </span>
          <h2>Pendapatan</h2>
        </div>
        <strong className="summary-value">+ {formatIdr(income)}</strong>
      </div>
      <div className="summary-card card summary-expense">
        <div className="summary-card-heading">
          <span className="summary-icon">
            <ArrowUpRight aria-hidden="true" />
          </span>
          <h2>Pengeluaran</h2>
        </div>
        <strong className="summary-value">− {formatIdr(expense)}</strong>
      </div>
      <div className="summary-card card summary-savings">
        <div className="summary-card-heading">
          <span className="summary-icon">
            <PiggyBank aria-hidden="true" />
          </span>
          <h2>Tabungan</h2>
        </div>
        <strong className="summary-value">
          {savings < 0n ? "− " : ""}
          {formatIdr(savings < 0n ? -savings : savings)}
        </strong>
      </div>
    </section>
  );
}
