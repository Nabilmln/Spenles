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
      <div className="flex items-center gap-[.5rem]">
        <span className="grid size-[2rem] place-items-center rounded-[.55rem] bg-primary-50 text-primary-600 dark:text-primary-700 [&_svg]:size-[1rem]">
          <CalendarDays aria-hidden="true" />
        </span>
        <div>
          <p className={`${eyebrowClass} mb-0`}>Rata-rata pengeluaran</p>
        </div>
      </div>
      <strong className="mt-[.7rem] block min-w-0 text-[clamp(1.2rem,2.5vw,1.65rem)] tracking-[-.04em] [overflow-wrap:anywhere]">
      <p className="m-0 mt-[.1rem] text-[.72rem] text-muted">per hari</p>
        {formatIdr(value)}
      </strong>
      {comparison ? (
        <p className="mt-[.55rem] m-0 text-[.78rem] text-muted">
          {comparison}
        </p>
      ) : null}
    </section>
  );
}