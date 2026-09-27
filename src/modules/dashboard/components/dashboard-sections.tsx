import { cardClass } from "@/components/ui/styles";
import type { AccountBalanceRow } from "@/modules/accounts";
import { DashboardSectionError } from "./dashboard-section-error";
import { MobileBalanceCard } from "./mobile-balance-card";
import { RecentActivityCard } from "./recent-activity";
import type { AggregateTotals, RecentDashboardTransaction } from "../types/dashboard";

type Totals = { selected: AggregateTotals; previous: AggregateTotals };

export function DashboardCardSkeleton({ label }: { label: string }) {
  return (
    <section aria-busy="true" aria-label={label} className={`${cardClass} flex h-full min-h-[9rem] flex-col gap-[.75rem] shadow-none`}>
      <span className="sr-only">Loading {label}...</span>
      <div className="flex items-center gap-[.5rem]">
        <div className="size-[2rem] animate-pulse rounded-[.55rem] bg-surface-subtle" />
        <div className="h-[.7rem] w-[6rem] animate-pulse rounded-[.3rem] bg-surface-subtle" />
      </div>
      <div className="h-[1.35rem] w-[7.5rem] animate-pulse rounded-[.35rem] bg-surface-subtle" />
      <div className="mt-auto h-[.7rem] w-full max-w-[13rem] animate-pulse rounded-[.3rem] bg-surface-subtle" />
    </section>
  );
}

export async function DashboardBalanceSection({ totalsPromise, accountsPromise }: {
  totalsPromise: Promise<Totals>;
  accountsPromise: Promise<AccountBalanceRow[]>;
}) {
  let income = 0n;
  let expense = 0n;
  let activeAccounts: AccountBalanceRow[] = [];
  try {
    const [totals, accounts] = await Promise.all([totalsPromise, accountsPromise]);
    income = totals.selected.income;
    expense = totals.selected.expense;
    activeAccounts = accounts.filter((account) => account.status === "active");
  } catch {
    // The balance card retains its zero fallback state.
  }
  const totalBalance = activeAccounts.reduce((sum, account) => sum + BigInt(account.balance), 0n);
  return <MobileBalanceCard accounts={activeAccounts} balance={totalBalance} income={income} expense={expense} />;
}

export async function DashboardRecentActivitySection({ activityPromise }: {
  activityPromise: Promise<RecentDashboardTransaction[]>;
}) {
  let rows: RecentDashboardTransaction[] = [];
  try {
    rows = await activityPromise;
  } catch {
    return <DashboardSectionError title="Recent activity not available yet" />;
  }
  return <RecentActivityCard rows={rows} />;
}
