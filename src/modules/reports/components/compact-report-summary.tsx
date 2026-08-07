import { formatIdr } from "@/lib/money/format-idr";

export type ReportTotals = {
  incomeIdr: string;
  expenseIdr: string;
  netIdr: string;
};

export function CompactReportSummary({
  totals,
}: {
  totals: ReportTotals;
}) {
  const net = BigInt(totals.netIdr);
  const netClass =
    net > 0n
      ? "report-summary-net-positive"
      : net < 0n
        ? "report-summary-net-negative"
        : "";
  return (
    <section aria-label="Ikhtisar periode" className="report-summary-compact">
      <div className="report-summary-cell report-summary-income">
        <span>Pendapatan</span>
        <strong>+{formatIdr(totals.incomeIdr)}</strong>
      </div>
      <div className="report-summary-cell report-summary-expense">
        <span>Pengeluaran</span>
        <strong>−{formatIdr(totals.expenseIdr)}</strong>
      </div>
      <div className="report-summary-cell report-summary-net">
        <span>Selisih</span>
        <strong className={netClass}>{formatIdr(net)}</strong>
      </div>
    </section>
  );
}