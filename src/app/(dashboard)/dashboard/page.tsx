import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatMonthYearLabel } from "@/lib/dates/format-id";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  AverageSpendingCard,
  buildCategoryChartContract,
  buildDailyCashFlowContract,
  buildDailyExpenseChartContract,
  buildFourDayExpenseChartContract,
  buildMonthlyCashFlowContract,
  buildWeeklyCashFlowContract,
  CashFlowOverviewCard,
  CategoryExpenseCard,
  compareFinancialValue,
  countCalendarDays,
  currentJakartaMonthKey,
  DashboardAccountCard,
  DashboardFeatureGrid,
  DashboardSectionError,
  FinancialOverview,
  fourDayJakartaInterval,
  getCategoryExpenseAggregates,
  getDailyExpenseAggregates,
  getDailyIncomeExpenseAggregates,
  getMonthlyAggregates,
  getRecentActivityTransactions,
  getSelectedAndPreviousTotals,
  getWeeklyIncomeExpenseAggregates,
  IncomeVsExpenseComparison,
  lastDaysJakartaInterval,
  lastMonthsJakartaInterval,
  lastWeeksJakartaInterval,
  MobileBalanceCard,
  MonthlyExpenseCard,
  monthIntervalForKey,
  RecentActivityCard,
  safeParseDashboardFilters,
  SavingsSummaryCard,
  shiftMonthKey,
  TopSpendingCard,
  type DashboardSearchParams,
  type IncomeExpensePoint,
} from "@/modules/dashboard";
import {
  getPeriodSavings,
  getSavingsBalanceTotal,
  listOwnedAccounts,
} from "@/modules/accounts";
import { getProfile } from "@/modules/profiles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

function isFulfilled<T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

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
            <h2 className="m-[0_0_.25rem]! text-base!">Periksa pilihan periode</h2>
            <p className="m-0 text-muted text-[.84rem]">{filtersResult.error}</p>
          </div>
          <Link className={buttonClass("primary")} href="/dashboard">
            Kembali ke bulan ini
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
  const recentInterval = fourDayJakartaInterval(now);
  const cashFlowDaysInterval = lastDaysJakartaInterval(7, now);
  const cashFlowWeeksInterval = lastWeeksJakartaInterval(4, now);
  const cashFlowMonthsInterval = lastMonthsJakartaInterval(12, now);
  const calendarDays = countCalendarDays(cardInterval);
  const prevCalendarDays = countCalendarDays(prevCardInterval);

  const [
    dailyResult,
    recentResult,
    activityResult,
    monthlyResult,
    cashFlowDailyResult,
    cashFlowWeeklyResult,
    cashFlowMonthlyResult,
    categoryResult,
    totalsResult,
    savingsResult,
    savingsBalanceResult,
    accountsResult,
  ] = await Promise.allSettled([
    getDailyExpenseAggregates(user.id, cardInterval),
    getDailyExpenseAggregates(user.id, recentInterval),
    getRecentActivityTransactions(user.id),
    getMonthlyAggregates(user.id, cardInterval),
    getDailyIncomeExpenseAggregates(user.id, cashFlowDaysInterval),
    getWeeklyIncomeExpenseAggregates(user.id, cashFlowWeeksInterval),
    getMonthlyAggregates(user.id, cashFlowMonthsInterval),
    getCategoryExpenseAggregates(user.id, cardInterval),
    getSelectedAndPreviousTotals(user.id, cardInterval, prevCardInterval),
    getPeriodSavings(user.id, cardInterval.start, cardInterval.end),
    getSavingsBalanceTotal(user.id),
    listOwnedAccounts(user.id),
  ]);

  const daily = isFulfilled(dailyResult)
    ? buildDailyExpenseChartContract(cardInterval, dailyResult.value)
    : null;
  const recent = buildFourDayExpenseChartContract(
    now,
    isFulfilled(recentResult) ? recentResult.value : [],
  );
  const overview = isFulfilled(monthlyResult)
    ? monthlyResult.value.reduce(
        (acc, row) => ({
          income: acc.income + row.income,
          expense: acc.expense + row.expense,
        }),
        { income: 0n, expense: 0n },
      )
    : { income: 0n, expense: 0n };

  function toCashFlowSeries(
    contract: {
      points: IncomeExpensePoint[];
      totalIncome: bigint;
      totalExpense: bigint;
    } | null,
  ) {
    return contract
      ? {
          points: contract.points,
          totalIncome: contract.totalIncome.toString(),
          totalExpense: contract.totalExpense.toString(),
        }
      : { points: [], totalIncome: "0", totalExpense: "0" };
  }

  const cashFlowDaily = toCashFlowSeries(
    isFulfilled(cashFlowDailyResult)
      ? buildDailyCashFlowContract(cashFlowDaysInterval, cashFlowDailyResult.value)
      : null,
  );
  const cashFlowWeekly = toCashFlowSeries(
    isFulfilled(cashFlowWeeklyResult)
      ? buildWeeklyCashFlowContract(cashFlowWeeksInterval, cashFlowWeeklyResult.value)
      : null,
  );
  const cashFlowMonthly = toCashFlowSeries(
    isFulfilled(cashFlowMonthlyResult)
      ? buildMonthlyCashFlowContract(cashFlowMonthsInterval, cashFlowMonthlyResult.value)
      : null,
  );

  const categoryRows = isFulfilled(categoryResult)
    ? categoryResult.value
    : [];
  const categoryContract = buildCategoryChartContract(categoryRows);

  const totals = isFulfilled(totalsResult) ? totalsResult.value : null;
  const averageDaily = totals
    ? totals.selected.expense / BigInt(calendarDays)
    : 0n;
  const prevAverageDaily = totals
    ? totals.previous.expense / BigInt(prevCalendarDays)
    : 0n;
  const averageComparison = compareFinancialValue(
    averageDaily,
    prevAverageDaily,
  );
  const incomeComparison = totals
    ? compareFinancialValue(totals.selected.income, totals.previous.income)
    : null;
  const expenseComparison = totals
    ? compareFinancialValue(totals.selected.expense, totals.previous.expense)
    : null;
  const savingsNet = isFulfilled(savingsResult)
    ? savingsResult.value.net
    : 0n;
  const savingsBalance = isFulfilled(savingsBalanceResult)
    ? savingsBalanceResult.value
    : 0n;
  const activeAccounts = isFulfilled(accountsResult)
    ? accountsResult.value.filter((account) => account.status === "active")
    : [];
  const totalBalance = activeAccounts.reduce(
    (sum, account) => sum + BigInt(account.balance),
    0n,
  );

  return (
    <div>
      <div className="dashboard-grid grid gap-3 min-[861px]:grid-cols-8 min-[1024px]:grid-cols-12">
        <div className="min-w-0 min-[861px]:col-span-4 min-[1024px]:col-span-4">
          <div className="hidden min-[861px]:block">
            <FinancialOverview
              name={profile?.displayName ?? "Pengguna Spenles"}
              income={overview.income.toString()}
              expense={overview.expense.toString()}
            />
          </div>
          <div className="min-[861px]:hidden">
            <MobileBalanceCard
              name={profile?.displayName ?? "Pengguna Spenles"}
              balance={totalBalance}
              income={overview.income}
              expense={overview.expense}
            />
          </div>
        </div>

        <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
          {totals ? (
            <IncomeVsExpenseComparison
              income={totals.selected.income}
              expense={totals.selected.expense}
              incomeChangeBps={incomeComparison?.changeBps ?? null}
              expenseChangeBps={expenseComparison?.changeBps ?? null}
              previousLabel={prevCardInterval.label}
            />
          ) : (
            <DashboardSectionError title="Perbandingan bulanan belum tersedia" />
          )}
        </div>

        <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
          {isFulfilled(savingsResult) && isFulfilled(savingsBalanceResult) ? (
            <SavingsSummaryCard
              balance={savingsBalance}
              periodNet={savingsNet}
            />
          ) : (
            <DashboardSectionError title="Ringkasan tabungan belum tersedia" />
          )}
        </div>
      </div>

      <div className="mx-0 mt-[1.55rem] grid gap-3 px-0">
        <div className="dashboard-grid grid gap-3 min-[861px]:grid-cols-8 min-[1024px]:grid-cols-12">
          <div className="min-w-0 min-[861px]:col-span-8 min-[1024px]:col-span-12">
            <p className="mb-[.55rem] text-[.72rem] font-semibold uppercase tracking-[.12em] text-muted">
              Layanan
            </p>
            <DashboardFeatureGrid />
          </div>

          <div className="min-w-0 min-[861px]:hidden">
            {daily ? (
              <MonthlyExpenseCard
                currentMonth={cardMonth}
                monthLabel={monthLabelFor(cardMonth)}
                monthPoints={daily.points}
                nextMonth={shiftMonthKey(cardMonth, 1)}
                prevMonth={shiftMonthKey(cardMonth, -1)}
                recentPoints={recent.points}
                totalExpense={daily.totalExpense}
                totalIncome={overview.income}
              />
            ) : (
              <DashboardSectionError title="Pengeluaran bulanan belum tersedia" />
            )}
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-8 min-[861px]:block min-[1024px]:col-span-8">
            <CashFlowOverviewCard
              daily={cashFlowDaily}
              monthly={cashFlowMonthly}
              weekly={cashFlowWeekly}
            />
          </div>

          <div className="min-w-0 min-[861px]:col-span-4 min-[1024px]:col-span-4">
            {isFulfilled(categoryResult) ? (
              <CategoryExpenseCard
                periodLabel={monthLabelFor(cardMonth)}
                points={categoryContract.points}
                totalExpense={categoryContract.totalExpense}
              />
            ) : (
              <DashboardSectionError title="Pengeluaran per kategori belum tersedia" />
            )}
          </div>

          <div className="min-w-0 min-[861px]:col-span-4 min-[1024px]:col-span-4">
            {isFulfilled(activityResult) ? (
              <RecentActivityCard rows={activityResult.value} />
            ) : (
              <DashboardSectionError title="Aktivitas terbaru belum tersedia" />
            )}
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
            {isFulfilled(categoryResult) ? (
              <TopSpendingCard
                periodLabel={monthLabelFor(cardMonth)}
                rows={categoryRows}
              />
            ) : (
              <DashboardSectionError title="Kategori teratas belum tersedia" />
            )}
          </div>

          <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-4">
            <div className="grid gap-3">
              {totals ? (
                <AverageSpendingCard
                  value={averageDaily}
                  changeBps={averageComparison.changeBps}
                  previousLabel={prevCardInterval.label}
                />
              ) : (
                <DashboardSectionError title="Rata-rata harian belum tersedia" />
              )}
              <DashboardAccountCard rows={activeAccounts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}