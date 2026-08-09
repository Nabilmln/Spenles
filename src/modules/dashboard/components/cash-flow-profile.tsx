import {
  Activity,
  CalendarRange,
  CircleAlert,
  CircleCheck,
  Layers3,
} from "lucide-react";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
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

const conditionBadgeClass: Record<string, string> = {
  healthy: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  attention: "text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  deficit: "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]",
  "no-data": "text-muted bg-surface-subtle",
};

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
    <section aria-labelledby="cash-flow-profile-title" className={`${cardClass} shadow-none`}>
      <div className="mb-4 flex items-start justify-between gap-4 max-[540px]:flex-col">
        <div>
          <p className={eyebrowClass}>Profil arus kas</p>
          <h2 id="cash-flow-profile-title" className="m-0 text-[1.08rem] tracking-[-.02em]">
            Pola keuangan periode ini
          </h2>
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-[.4rem] rounded-full p-[.4rem_.65rem] text-[.75rem] font-medium max-[540px]:self-start",
            conditionBadgeClass[snapshot.condition],
          )}
        >
          <ConditionIcon size={18} />
          <span>{condition.label}</span>
        </div>
      </div>
      <p className="-mt-[.35rem] mb-4 text-[.82rem] text-muted">{condition.description}</p>
      <dl className="m-0 grid gap-0">
        <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
          <dt className="flex items-center gap-[.35rem] text-[.75rem] text-muted">Rata-rata pemasukan bulanan</dt>
          <dd className="m-0 font-medium [overflow-wrap:anywhere]">{formatIdr(snapshot.averageIncome)}</dd>
        </div>
        <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
          <dt className="flex items-center gap-[.35rem] text-[.75rem] text-muted">Rata-rata pengeluaran bulanan</dt>
          <dd className="m-0 font-medium [overflow-wrap:anywhere]">{formatIdr(snapshot.averageExpense)}</dd>
        </div>
        <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
          <dt className="flex items-center gap-[.35rem] text-[.75rem] text-muted">Rata-rata arus kas bulanan</dt>
          <dd className="m-0 font-medium [overflow-wrap:anywhere]">{formatIdr(snapshot.averageNet)}</dd>
        </div>
        <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
          <dt className="flex items-center gap-[.35rem] text-[.75rem] text-muted">Rasio pengeluaran</dt>
          <dd className="m-0 font-medium [overflow-wrap:anywhere]">{formatRatio(snapshot.expenseRatioBps)}</dd>
        </div>
        <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
          <dt className="flex items-center gap-[.35rem] text-[.75rem] text-muted"><Layers3 size={16} /> Kategori pengeluaran terbesar</dt>
          <dd className="m-0 font-medium [overflow-wrap:anywhere]">
            {snapshot.largestExpenseCategory
              ? `${snapshot.largestExpenseCategory.name} · ${formatIdr(
                  snapshot.largestExpenseCategory.expense,
                )}`
              : "Belum tersedia"}
          </dd>
        </div>
        <div className="grid gap-[.25rem] border-b border-border p-[.75rem_0]">
          <dt className="flex items-center gap-[.35rem] text-[.75rem] text-muted"><CalendarRange size={16} /> Bulan pengeluaran tertinggi</dt>
          <dd className="m-0 font-medium [overflow-wrap:anywhere]">
            {snapshot.highestExpenseMonth
              ? `${formatMonth(snapshot.highestExpenseMonth.period)} · ${formatIdr(
                  snapshot.highestExpenseMonth.expense,
                )}`
              : "Belum tersedia"}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-[.76rem] text-muted">
        Rata-rata memakai {snapshot.includedMonthCount} bulan kalender,
        termasuk bulan tanpa transaksi. Aktivitas tercatat pada{" "}
        {snapshot.monthsWithData} bulan.
      </p>
      <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-[.75rem] text-[.76rem] text-muted">
        Indikator ini bersifat informasional dan bukan nasihat keuangan
        profesional.
      </p>
    </section>
  );
}
