import { ArrowDownLeft, ArrowUpRight, WalletCards } from "lucide-react";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
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
    <article className={`${cardClass} summary-${tone} grid min-w-0 gap-[.35rem] shadow-none ${tone === "net" ? "max-[860px]:col-span-full max-[540px]:col-auto" : ""}`}>
      <div className="flex items-center gap-[.5rem]">
        <span className={`grid size-[2rem] place-items-center rounded-[.6rem] [&_svg]:size-[1rem] ${tone === "income" ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]" : tone === "expense" ? "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]" : "text-primary-600 bg-primary-50"}`}>
          {icon}
        </span>
        <h2 className="m-0 text-[.8rem] text-muted">{title}</h2>
      </div>
      <strong className="wrap-anywhere text-[clamp(1.1rem,2vw,1.65rem)] tracking-[-.04em]">{formatIdr(value)}</strong>
      <p className="min-h-[2.2em] m-0 text-[.72rem] text-muted">{comparisonText(comparison, previousLabel)}</p>
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
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className={eyebrowClass}>Ringkasan</p>
          <h2 id="financial-summary-title" className="m-0 text-[.95rem] tracking-[-.02em]">Arus kas periode terpilih</h2>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3 max-[860px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[540px]:grid-cols-1">
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
