import Link from "next/link";
import { Suspense } from "react";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatMonthYearLabel } from "@/lib/dates/format-id";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  countCalendarDays,
  currentJakartaMonthKey,
  DashboardAveragesSection,
  DashboardBalanceSection,
  DashboardCardSkeleton,
  DashboardCashFlowSection,
  DashboardCategorySection,
  DashboardComparisonSection,
  DashboardMonthlyExpenseSection,
  DashboardRecentActivitySection,
  DashboardSavingsSection,
  DashboardTopSpendingSection,
  fourDayJakartaInterval,
  getCategoryExpenseAggregates,
  getDailyExpenseAggregates,
  getDailyIncomeExpenseAggregates,
  getMonthlyAggregates,
  getRecentActivityTransactions,
  getSelectedAndPreviousTotals,
  getWeeklyIncomeExpenseAggregates,
  lastDaysJakartaInterval,
  lastMonthsJakartaInterval,
  lastWeeksJakartaInterval,
  monthIntervalForKey,
  safeParseDashboardFilters,
  ServicesSection,
  shiftMonthKey,
  type DashboardSearchParams,
} from "@/modules/dashboard";
import {
  getPeriodSavings,
  getSavingsBalanceTotal,
  listOwnedAccounts,
} from "@/modules/accounts";
import { getProfile } from "@/modules/profiles";
import type { Profile } from "@/db/schema";

function profileFallback(userId: string): Profile {
  return {
    id: userId,
    userId,
    displayName: "Pengguna Spenles",
    defaultCurrency: "IDR",
    timezone: "Asia/Jakarta",
    theme: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

function monthLabelFor(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return formatMonthYearLabel(year, month);
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await requireSessionUser();
  const [profile, rawSearchParams] = await Promise.all([
    getProfile(user.id),
    searchParams,
  ]);
  const filtersResult = safeParseDashboardFilters(rawSearchParams);

  if (!filtersResult.success) {
    return (
      <div className="grid gap-[1.75rem]">
        <section className={`${cardClass} flex items-center gap-[.8rem] shadow-none`} role="alert">
          <div>
            <h2 className="m-[0_0_.25rem]! text-base!">Check your period selection</h2>
            <p className="m-0 text-muted text-[.84rem]">{filtersResult.error}</p>
          </div>
          <Link className={buttonClass("primary")} href="/dashboard">
            Back to this month
          </Link>
        </section>
      </div>
    );
  }

  const cardMonth =
    filtersResult.data.selection.kind === "month"
      ? filtersResult.data.selection.month
      : currentJakartaMonthKey();
  const cardInterval = monthIntervalForKey(cardMonth);
  const prevCardInterval = monthIntervalForKey(shiftMonthKey(cardMonth, -1));
  const now = new Date();
  const cashFlowDaysInterval = lastDaysJakartaInterval(7, now);
  const cashFlowWeeksInterval = lastWeeksJakartaInterval(4, now);
  const cashFlowMonthsInterval = lastMonthsJakartaInterval(12, now);
  const calendarDays = countCalendarDays(cardInterval);
  const prevCalendarDays = countCalendarDays(prevCardInterval);

  const totalsPromise = getSelectedAndPreviousTotals(
    user.id,
    cardInterval,
    prevCardInterval,
  );
  const accountsPromise = listOwnedAccounts(user.id);
  const categoryPromise = getCategoryExpenseAggregates(user.id, cardInterval);
  const activityPromise = getRecentActivityTransactions(user.id);
  const dailyPromise = getDailyExpenseAggregates(user.id, cardInterval);
  const recentPromise = getDailyExpenseAggregates(
    user.id,
    fourDayJakartaInterval(now),
  );
  const cashFlowDailyPromise = getDailyIncomeExpenseAggregates(
    user.id,
    cashFlowDaysInterval,
  );
  const cashFlowWeeklyPromise = getWeeklyIncomeExpenseAggregates(
    user.id,
    cashFlowWeeksInterval,
  );
  const cashFlowMonthlyPromise = getMonthlyAggregates(
    user.id,
    cashFlowMonthsInterval,
  );
  const savingsPromise = getPeriodSavings(
    user.id,
    cardInterval.start,
    cardInterval.end,
  );
  const savingsBalancePromise = getSavingsBalanceTotal(user.id);

  const servicesProfile: Profile =
    profile ?? profileFallback(user.id);
  const displayName = profile?.displayName ?? "Pengguna Spenles";

  return (
    <div>
      <div className="dashboard-grid grid gap-3 min-[861px]:grid-cols-8 min-[1024px]:grid-cols-12">
        <div className="min-w-0 min-[861px]:col-span-4 min-[1024px]:col-span-4">
          <Suspense fallback={<DashboardCardSkeleton label="Financial summary" />}>
            <DashboardBalanceSection
              accountsPromise={accountsPromise}
              name={displayName}
              totalsPromise={totalsPromise}
            />
          </Suspense>
        </div>

        <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
          <Suspense fallback={<DashboardCardSkeleton label="Monthly comparison" />}>
            <DashboardComparisonSection
              previousLabel={prevCardInterval.label}
              totalsPromise={totalsPromise}
            />
          </Suspense>
        </div>

        <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
          <Suspense fallback={<DashboardCardSkeleton label="Savings summary" />}>
            <DashboardSavingsSection
              balancePromise={savingsBalancePromise}
              savingsPromise={savingsPromise}
            />
          </Suspense>
        </div>
      </div>

      <div className="mx-0 mt-[1.55rem] grid gap-3 px-0">
        <div className="dashboard-grid grid gap-3 min-[861px]:grid-cols-8 min-[1024px]:grid-cols-12">
          <div className="min-w-0 min-[861px]:col-span-8 min-[1024px]:col-span-12">
            <ServicesSection profile={servicesProfile} email={user.email ?? ""} />
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-8 min-[861px]:block min-[1024px]:col-span-8">
            <Suspense fallback={<DashboardCardSkeleton label="Monthly expenses" />}>
              <DashboardMonthlyExpenseSection
                cardInterval={cardInterval}
                cardMonth={cardMonth}
                dailyPromise={dailyPromise}
                monthLabel={monthLabelFor(cardMonth)}
                nextMonth={shiftMonthKey(cardMonth, 1)}
                now={now}
                prevMonth={shiftMonthKey(cardMonth, -1)}
                recentPromise={recentPromise}
                totalsPromise={totalsPromise}
              />
            </Suspense>
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-8 min-[861px]:block min-[1024px]:col-span-8">
            <Suspense fallback={<DashboardCardSkeleton label="Cash flow" />}>
              <DashboardCashFlowSection
                dailyPromise={cashFlowDailyPromise}
                daysInterval={cashFlowDaysInterval}
                monthlyPromise={cashFlowMonthlyPromise}
                monthsInterval={cashFlowMonthsInterval}
                weeklyPromise={cashFlowWeeklyPromise}
                weeksInterval={cashFlowWeeksInterval}
              />
            </Suspense>
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
            <Suspense fallback={<DashboardCardSkeleton label="Category expenses" />}>
              <DashboardCategorySection
                categoryPromise={categoryPromise}
                periodLabel={monthLabelFor(cardMonth)}
              />
            </Suspense>
          </div>

          <div className="min-w-0 min-[861px]:col-span-4 min-[1024px]:col-span-4">
            <Suspense fallback={<DashboardCardSkeleton label="Recent activity" />}>
              <DashboardRecentActivitySection activityPromise={activityPromise} />
            </Suspense>
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
            <Suspense fallback={<DashboardCardSkeleton label="Top spending" />}>
              <DashboardTopSpendingSection
                categoryPromise={categoryPromise}
                periodLabel={monthLabelFor(cardMonth)}
              />
            </Suspense>
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
            <Suspense fallback={<DashboardCardSkeleton label="Daily average" />}>
              <DashboardAveragesSection
                accountsPromise={accountsPromise}
                calendarDays={calendarDays}
                prevCalendarDays={prevCalendarDays}
                previousLabel={prevCardInterval.label}
                totalsPromise={totalsPromise}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}