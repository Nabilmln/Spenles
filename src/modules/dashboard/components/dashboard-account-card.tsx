import Link from "next/link";
import { Banknote, Coins, Landmark, List, PiggyBank, Wallet } from "lucide-react";
import { cardClass, eyebrowClass, textLinkClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { accountTypeLabel } from "@/modules/accounts/constants/account-types";

const typeIcon = {
  cash: Banknote,
  bank: Landmark,
  e_wallet: Wallet,
  savings: PiggyBank,
  other: Coins,
} as const;

const MAX_ROWS = 5;

type Row = {
  id: string;
  name: string;
  type: keyof typeof typeIcon;
  balance: string;
};

export function DashboardAccountCard({ rows }: { rows: Row[] }) {
  const visible = rows.slice(0, MAX_ROWS);
  const hiddenCount = rows.length - visible.length;

  return (
    <section
      aria-labelledby="dashboard-account-title"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <div className="mb-[.65rem] flex items-start justify-between gap-3 max-[540px]:flex-col">
        <div>
          <p className={eyebrowClass}>Accounts</p>
          <h2 id="dashboard-account-title" className="m-0 text-[.95rem] tracking-[-.02em]">
            Accounts in use
          </h2>
        </div>
        <Link
          className={`${textLinkClass} inline-flex items-center gap-[.3rem] text-[.76rem]`}
          href="/accounts"
        >
          <List size={14} aria-hidden="true" />
          View accounts
        </Link>
      </div>

      {visible.length ? (
        <div className="grid flex-1">
          {visible.map((row) => {
            const Icon = typeIcon[row.type] ?? Coins;
            const negative = BigInt(row.balance) < 0n;
            return (
              <article
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.65rem] border-b border-border p-[.6rem_0] last:border-0"
                key={row.id}
              >
                <span className="grid size-[2.2rem] shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600 dark:text-primary-700 [&_svg]:size-[.95rem]">
                  <Icon aria-hidden="true" />
                </span>
                <div className="grid min-w-0">
                  <strong className="truncate text-[.83rem]">{row.name}</strong>
                  <span className="text-[.72rem] text-muted">{accountTypeLabel(row.type)}</span>
                </div>
                <strong className={`text-[.8rem] ${negative ? "text-expense" : ""}`}>
                  {formatIdr(row.balance)}
                </strong>
              </article>
            );
          })}
          {hiddenCount > 0 ? (
            <p className="m-0 pt-[.5rem] text-center text-[.72rem] text-muted">
              +{hiddenCount} more accounts
            </p>
          ) : null}
        </div>
      ) : (
        <div
          className="mt-3 grid min-h-[4rem] flex-1 place-items-center rounded-[.65rem] border border-dashed border-border bg-surface-subtle p-3 text-center text-[.8rem] text-muted"
          role="status"
        >
          No accounts yet. Create an account in the Accounts menu.
        </div>
      )}
    </section>
  );
}