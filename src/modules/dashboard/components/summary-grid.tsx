import { ArrowDownLeft, ArrowUpRight, WalletCards } from "lucide-react";
import { formatIdr } from "@/lib/money/format-idr";
import type { FinancialSnapshot } from "../services/financial-metrics";
import type { TotalsComparison } from "../types/dashboard";

function formatBasisPoints(value: string) {
  const bps = BigInt(value);
  const sign = bps > 0n ? "+" : bps < 0n ? "−" : "";
  const absolute = bps < 0n ? -bps : bps;
  const whole = absolute / 100n;
  const fraction = String(absolute % 100n).padStart(2, "0");
  return `${sign}${whole.toLocaleString("id-ID")},${fraction}%`;
}

function comparisonText(
  comparison: TotalsComparison,
  previousLabel: string,
) {
  switch (comparison.state) {
    case "new":
      return `Aktivitas baru; sebelumnya ${formatIdr(0n)}`;
    case "unchanged-zero":
      return "Belum ada aktivitas pada kedua periode";
    case "absolute-only": {
      const sign = comparison.delta > 0n ? "+" : comparison.delta < 0n ? "−" : "";
      return `Selisih ${sign}${formatIdr(
        comparison.delta < 0n ? -comparison.delta : comparison.delta,
      )}; persentase tidak tersedia`;
    }
    case "unchanged":
      return `Tidak berubah dari ${previousLabel}`;
    case "increase":
    case "decrease":
      return `${formatBasisPoints(comparison.changeBps!)} dari ${previousLabel}`;
  }
}

function SummaryCard({
  tone,
  title,
  value,
  comparison,
  previousLabel,
  icon,
}: {
  tone: "income" | "expense" | "net";
  title: string;
  value: bigint;
  comparison: TotalsComparison;
  previousLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <article className={`summary-card card summary-${tone}`}>
      <div className="summary-card-heading">
        <span className="summary-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <strong className="summary-value">{formatIdr(value)}</strong>
      <p>{comparisonText(comparison, previousLabel)}</p>
    </article>
  );
}

export function SummaryGrid({
  snapshot,
  previousLabel,
}: {
  snapshot: FinancialSnapshot;
  previousLabel: string;
}) {
  return (
    <section aria-labelledby="financial-summary-title">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Ringkasan</p>
          <h2 id="financial-summary-title">Arus kas periode terpilih</h2>
        </div>
      </div>
      <div className="summary-grid">
        <SummaryCard
          comparison={snapshot.incomeComparison}
          icon={<ArrowDownLeft />}
          previousLabel={previousLabel}
          title="Total pemasukan"
          tone="income"
          value={snapshot.income}
        />
        <SummaryCard
          comparison={snapshot.expenseComparison}
          icon={<ArrowUpRight />}
          previousLabel={previousLabel}
          title="Total pengeluaran"
          tone="expense"
          value={snapshot.expense}
        />
        <SummaryCard
          comparison={snapshot.netComparison}
          icon={<WalletCards />}
          previousLabel={previousLabel}
          title="Arus kas bersih"
          tone="net"
          value={snapshot.net}
        />
      </div>
    </section>
  );
}
