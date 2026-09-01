import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatJakartaDateLong, JAKARTA_OFFSET_MS } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import { formatLongDateUtc } from "@/lib/dates/format-id";
import { cardClass } from "@/components/ui/styles";
import type { RecentDashboardTransaction } from "../types/dashboard";

const DAY_MS = 86_400_000;
const MAX_ITEMS = 5;
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
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  if (offset === 2) return "2 days ago";
  return formatLongDateUtc(day);
}

export function RecentActivityCard({
  rows,
}: {
  rows: RecentDashboardTransaction[];
}) {
  const today = todayKey();
  const groups = new Map<string, RecentDashboardTransaction[]>();
  for (const row of rows.slice(0, MAX_ITEMS)) {
    const day = jakartaDayKey(row.transactionAt);
    const bucket = groups.get(day) ?? [];
    bucket.push(row);
    groups.set(day, bucket);
  }
  const orderedDays = [...groups.keys()].sort().reverse();

  return (
    <section aria-labelledby="recent-activity-title" className={`${cardClass} flex h-full flex-col shadow-none`}>
      <div className="mb-[.65rem] flex items-center justify-between gap-3">
        <h2 id="recent-activity-title" className="m-0 text-[1.05rem] tracking-[-.02em]">Recent activity</h2>
        <Link
          className="inline-flex items-center whitespace-nowrap text-[.76rem] font-medium text-primary-600 hover:text-primary-700"
          href="/transactions"
        >
          View all
          <span aria-hidden="true" className="ml-[.2rem] text-[0.95rem] leading-none">&gt;</span>
        </Link>
      </div>

      {orderedDays.length ? (
        <div className="grid flex-1">
          {orderedDays.map((day) => (
            <section key={day}>
              <h3 className="my-[.7rem_.1rem] text-[.7rem] font-semibold uppercase tracking-[.08em] text-muted [&:first-child]:mt-[.35rem]">
                {groupLabel(today, day)}
              </h3>
              <div className="grid">
                {groups.get(day)!.map((row) => (
                  <article
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.7rem] border-b border-border p-[.65rem_0] last:border-0 max-[540px]:grid-cols-[auto_minmax(0,1fr)]"
                    key={row.id}
                  >
                    <span
                      className={`grid size-[2.3rem] shrink-0 place-items-center rounded-full [&_svg]:size-[1rem] ${
                        row.type === "income"
                          ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]"
                          : "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]"
                      }`}
                    >
                      {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
                    </span>
                    <div className="grid min-w-0">
                      <strong className="truncate text-[.86rem]">{row.categoryName}</strong>
                      <span className="truncate text-[.72rem] text-muted">
                        {row.accountName} · {formatJakartaDateLong(row.transactionAt)}
                      </span>
                      {row.note ? <small className="truncate text-[.72rem] text-muted">{row.note}</small> : null}
                    </div>
                    <strong
                      className={`text-[.82rem] max-[540px]:col-start-2 ${
                        row.type === "income" ? "text-income" : "text-expense"
                      }`}
                    >
                      {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div
          className="mt-3 grid min-h-[5rem] flex-1 place-items-center rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-4 text-center"
          role="status"
        >
          <div className="grid gap-[.2rem]">
            <p className="m-0 text-[.85rem] font-medium text-foreground">No expenses yet</p>
            <p className="m-0 text-[.78rem] text-muted">Start recording your first expense.</p>
            <Link className="mx-auto mt-[.6rem] text-[.78rem] font-medium text-primary-600 hover:text-primary-700" href="/transactions/new">
              Record expense
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}