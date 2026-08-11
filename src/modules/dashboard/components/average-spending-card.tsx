import { CalendarDays } from "lucide-react";
import { cardClass, eyebrowClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { formatChangeBps } from "../services/financial-metrics";

function comparisonLabel(changeBps: string | null, previousLabel: string) {
  if (changeBps === null) return null;
  const bps = BigInt(changeBps);
  if (bps === 0n) return `Sama dengan ${previousLabel}`;
  const arrow = bps > 0n ? "▲" : "▼";
  return `${arrow} ${formatChangeBps(changeBps)} dibanding ${previousLabel}`;
}

export function AverageSpendingCard({
  value,
  changeBps,
  previousLabel,
}: {
  value: bigint;
  changeBps: string | null;
  previousLabel: string;
}) {
  const comparison = comparisonLabel(changeBps, previousLabel);

  return (
    <section
      aria-label="Rata-rata pengeluaran per hari"
      className={`${cardClass} shadow-none`}
    >
      <div className="flex items-center gap-[.65rem]">
        <span className="grid size-[2.35rem] place-items-center rounded-[.7rem] bg-surface-subtle text-primary-700 dark:text-[#93c5fd] [&_svg]:size-[1.15rem]">
          <CalendarDays aria-hidden="true" />
        </span>
        <div>
          <p className={`${eyebrowClass} mb-0`}>Rata-rata</p>
          <h2 className="m-0 text-[1.05rem] tracking-[-.02em]">
            Pengeluaran per hari
          </h2>
        </div>
      </div>
      <strong className="mt-[.9rem] block min-w-0 text-[clamp(1.4rem,3vw,2rem)] tracking-[-.04em] [overflow-wrap:anywhere]">
        {formatIdr(value)}
      </strong>
      <p className="m-0 mt-[.15rem] text-[.78rem] text-muted">per hari</p>
      {comparison ? (
        <p className="mt-[.55rem] m-0 text-[.78rem] text-muted">
          {comparison}
        </p>
      ) : null}
    </section>
  );
}