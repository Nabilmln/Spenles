import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { formatChangeBps } from "../services/financial-metrics";

function barWidth(value: bigint, maximum: bigint) {
  const capped = maximum > 0n ? maximum : 1n;
  const percent = (value * 100n) / capped;
  return `${Number(percent)}%`;
}

function changeLabel(changeBps: string | null, previousLabel: string) {
  if (changeBps === null) return null;
  const bps = BigInt(changeBps);
  if (bps === 0n) return `Sama dengan ${previousLabel}`;
  const arrow = bps > 0n ? "▲" : "▼";
  return `${arrow} ${formatChangeBps(changeBps)} dibanding ${previousLabel}`;
}

const toneBarClass = {
  income: "bg-[var(--income)]",
  expense: "bg-[var(--expense)]",
} as const;

function ComparisonRow({
  changeBps,
  label,
  maximum,
  previousLabel,
  tone,
  value,
}: {
  changeBps: string | null;
  label: string;
  maximum: bigint;
  previousLabel: string;
  tone: keyof typeof toneBarClass;
  value: bigint;
}) {
  const comparison = changeLabel(changeBps, previousLabel);
  return (
    <div className="grid gap-[.25rem]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[.75rem] font-medium text-muted">{label}</span>
        <strong className="min-w-0 text-[.85rem] [overflow-wrap:anywhere]">
          {formatIdr(value)}
        </strong>
      </div>
      <div
        className="h-[6px] overflow-hidden rounded-full bg-surface-subtle"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${toneBarClass[tone]}`}
          style={{ width: barWidth(value, maximum) }}
        />
      </div>
      {comparison ? (
        <p className="m-0 text-[.72rem] text-muted">{comparison}</p>
      ) : null}
    </div>
  );
}

export function IncomeVsExpenseComparison({
  income,
  expense,
  incomeChangeBps,
  expenseChangeBps,
  previousLabel,
}: {
  income: bigint;
  expense: bigint;
  incomeChangeBps: string | null;
  expenseChangeBps: string | null;
  previousLabel: string;
}) {
  const maximum = income > expense ? income : expense;

  return (
    <section
      aria-label="Perbandingan pemasukan dan pengeluaran"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <p className={eyebrowClass}>Perbandingan</p>
      <h2 className="m-0 mb-[.85rem] text-[.95rem] tracking-[-.02em]">
        Pemasukan vs Pengeluaran
      </h2>
      <div className="grid flex-1 content-center gap-[.85rem]">
        <ComparisonRow
          changeBps={incomeChangeBps}
          label="Pemasukan bulan ini"
          maximum={maximum}
          previousLabel={previousLabel}
          tone="income"
          value={income}
        />
        <ComparisonRow
          changeBps={expenseChangeBps}
          label="Pengeluaran bulan ini"
          maximum={maximum}
          previousLabel={previousLabel}
          tone="expense"
          value={expense}
        />
      </div>
    </section>
  );
}