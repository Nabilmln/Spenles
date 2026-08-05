import {
  Activity,
  CalendarRange,
  CircleAlert,
  CircleCheck,
  Layers3,
} from "lucide-react";
import { formatIdr } from "@/lib/money/format-idr";
import type { FinancialSnapshot } from "../services/financial-metrics";

const conditionContent = {
  healthy: {
    label: "Sehat",
    description: "Rasio pengeluaran di bawah 70% dan arus kas tidak negatif.",
    icon: CircleCheck,
  },
  attention: {
    label: "Perlu perhatian",
    description: "Rasio pengeluaran berada di antara 70% dan 90%.",
    icon: CircleAlert,
  },
  deficit: {
    label: "Defisit",
    description: "Pengeluaran terlalu tinggi atau arus kas bersih negatif.",
    icon: CircleAlert,
  },
  "no-data": {
    label: "Belum ada data",
    description: "Belum ada pemasukan maupun pengeluaran pada periode ini.",
    icon: Activity,
  },
} as const;

function formatRatio(value: string | null) {
  if (value === null) return "Tidak tersedia";
  const bps = BigInt(value);
  return `${(bps / 100n).toLocaleString("id-ID")},${String(
    bps % 100n,
  ).padStart(2, "0")}%`;
}

function formatMonth(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function CashFlowProfile({
  snapshot,
}: {
  snapshot: FinancialSnapshot;
}) {
  const condition = conditionContent[snapshot.condition];
  const ConditionIcon = condition.icon;

  return (
    <section aria-labelledby="cash-flow-profile-title" className="profile-card card">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Profil arus kas</p>
          <h2 id="cash-flow-profile-title">Pola keuangan periode ini</h2>
        </div>
        <div className={`condition-badge condition-${snapshot.condition}`}>
          <ConditionIcon size={18} />
          <span>{condition.label}</span>
        </div>
      </div>
      <p className="condition-description">{condition.description}</p>
      <dl className="profile-metrics">
        <div>
          <dt>Rata-rata pemasukan bulanan</dt>
          <dd>{formatIdr(snapshot.averageIncome)}</dd>
        </div>
        <div>
          <dt>Rata-rata pengeluaran bulanan</dt>
          <dd>{formatIdr(snapshot.averageExpense)}</dd>
        </div>
        <div>
          <dt>Rata-rata arus kas bulanan</dt>
          <dd>{formatIdr(snapshot.averageNet)}</dd>
        </div>
        <div>
          <dt>Rasio pengeluaran</dt>
          <dd>{formatRatio(snapshot.expenseRatioBps)}</dd>
        </div>
        <div>
          <dt><Layers3 size={16} /> Kategori pengeluaran terbesar</dt>
          <dd>
            {snapshot.largestExpenseCategory
              ? `${snapshot.largestExpenseCategory.name} · ${formatIdr(
                  snapshot.largestExpenseCategory.expense,
                )}`
              : "Belum tersedia"}
          </dd>
        </div>
        <div>
          <dt><CalendarRange size={16} /> Bulan pengeluaran tertinggi</dt>
          <dd>
            {snapshot.highestExpenseMonth
              ? `${formatMonth(snapshot.highestExpenseMonth.period)} · ${formatIdr(
                  snapshot.highestExpenseMonth.expense,
                )}`
              : "Belum tersedia"}
          </dd>
        </div>
      </dl>
      <p className="profile-denominator">
        Rata-rata memakai {snapshot.includedMonthCount} bulan kalender,
        termasuk bulan tanpa transaksi. Aktivitas tercatat pada{" "}
        {snapshot.monthsWithData} bulan.
      </p>
      <p className="financial-disclaimer">
        Indikator ini bersifat informasional dan bukan nasihat keuangan
        profesional.
      </p>
    </section>
  );
}
