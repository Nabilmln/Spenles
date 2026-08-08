import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, List } from "lucide-react";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
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
    <section aria-labelledby="rolling-three-day-title" className="rolling-days-card card">
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Aktivitas terbaru</p>
          <h2 id="rolling-three-day-title">3 hari terakhir</h2>
        </div>
        <Link className="text-link dashboard-link" href="/transactions">
          <List size={17} aria-hidden="true" />
          Lihat semua
        </Link>
      </div>

      {orderedDays.length ? (
        <div className="rolling-days">
          {orderedDays.map((day) => (
            <section className="rolling-day-group" key={day}>
              <h3>{groupLabel(today, day)}</h3>
              <div className="recent-list">
                {groups.get(day)!.map((row) => (
                  <article className="recent-row" key={row.id}>
                    <span className={`transaction-icon ${row.type}`}>
                      {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
                    </span>
                    <div className="recent-copy">
                      <strong>{row.categoryName}</strong>
                      <span>
                        {row.accountName} · {formatJakartaDateLong(row.transactionAt)}
                      </span>
                      {row.note ? <small>{row.note}</small> : null}
                    </div>
                    <strong className={`transaction-amount ${row.type}`}>
                      {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="dashboard-inline-empty" role="status">
          Belum ada transaksi dalam 3 hari terakhir.
        </div>
      )}
    </section>
  );
}
