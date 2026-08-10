import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, List } from "lucide-react";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { cardClass, eyebrowClass, textLinkClass } from "@/components/ui/styles";
import type { RecentDashboardTransaction } from "../types/dashboard";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;
const pad = (value: number) => String(value).padStart(2, "0");

function jakartaDayKey(date: Date) {
  const shifted = new Date(date.getTime() + JAKARTA_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

function todayKey() {
  return jakartaDayKey(new Date());
}

function dayOffset(today: string, day: string) {
  const start = new Date(`${today}T00:00:00Z`).getTime();
  const target = new Date(`${day}T00:00:00Z`).getTime();
  return Math.round((start - target) / DAY_MS);
}

function groupLabel(today: string, day: string) {
  const offset = dayOffset(today, day);
  if (offset === 0) return "Hari ini";
  if (offset === 1) return "Kemarin";
  if (offset === 2) return "2 hari lalu";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export function RollingThreeDayTransactions({
  rows,
}: {
  rows: RecentDashboardTransaction[];
}) {
  const today = todayKey();
  const groups = new Map<string, RecentDashboardTransaction[]>();
  for (const row of rows) {
    const day = jakartaDayKey(row.transactionAt);
    const bucket = groups.get(day) ?? [];
    bucket.push(row);
    groups.set(day, bucket);
  }
  const orderedDays = [...groups.keys()].sort().reverse();

  return (
    <section aria-labelledby="rolling-three-day-title" className={`${cardClass} flex h-full flex-col shadow-none`}>
      <div className="mb-4 flex items-start justify-between gap-4 max-[540px]:flex-col">
        <div>
          <p className={eyebrowClass}>Aktivitas terbaru</p>
          <h2 id="rolling-three-day-title" className="m-0 text-[1.08rem] tracking-[-.02em]">3 hari terakhir</h2>
        </div>
        <Link className={`${textLinkClass} inline-flex items-center gap-[.4rem] text-[.82rem]`} href="/transactions">
          <List size={17} aria-hidden="true" />
          Lihat semua
        </Link>
      </div>

      {orderedDays.length ? (
        <div className="grid flex-1">
          {orderedDays.map((day) => (
            <section key={day}>
              <h3 className="my-[1.1rem_.15rem] text-[.8rem] uppercase tracking-[.06em] [&:first-child]:mt-[.5rem]">
                {groupLabel(today, day)}
              </h3>
              <div className="grid">
                {groups.get(day)!.map((row) => (
                  <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.85rem] border-b border-border p-[.85rem_0] last:border-0 max-[540px]:grid-cols-[auto_minmax(0,1fr)]" key={row.id}>
                    <span className={`grid size-[2.7rem] shrink-0 place-items-center rounded-full ${row.type === "income" ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]" : "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]"}`}>
                      {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
                    </span>
                    <div className="grid min-w-0">
                      <strong>{row.categoryName}</strong>
                      <span className="truncate text-[.76rem] text-muted">
                        {row.accountName} · {formatJakartaDateLong(row.transactionAt)}
                      </span>
                      {row.note ? <small className="truncate text-[.76rem] text-muted">{row.note}</small> : null}
                    </div>
                    <strong className={`max-[540px]:col-start-2 ${row.type === "income" ? "text-income" : "text-expense"}`}>
                      {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid min-h-[10rem] flex-1 place-items-center rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-4 text-center text-[.84rem] text-muted" role="status">
          Belum ada transaksi dalam 3 hari terakhir.
        </div>
      )}
    </section>
  );
}
