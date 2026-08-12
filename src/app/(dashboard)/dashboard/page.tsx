import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  AverageSpendingCard,
  buildCategoryChartContract,
  buildDailyExpenseChartContract,
  buildFourDayExpenseChartContract,
  buildMonthlyChartContract,
  CashFlowOverviewCard,
  CategoryExpenseCard,
  compareFinancialValue,
  countCalendarDays,
  currentJakartaMonthKey,
  DashboardFeatureGrid,
  DashboardSectionError,
  FinancialOverview,
  fourDayJakartaInterval,
  getCategoryExpenseAggregates,
  getDailyExpenseAggregates,
  getMonthlyAggregates,
  getRollingThreeDayTransactions,
  getSelectedAndPreviousTotals,
  IncomeVsExpenseComparison,
  MonthlyExpenseCard,
  monthIntervalForKey,
  resolveDashboardPeriods,
  RollingThreeDayTransactions,
  safeParseDashboardFilters,
  SavingsSummaryCard,
  shiftMonthKey,
  TopSpendingCard,
  type DashboardSearchParams,
} from "@/modules/dashboard";
import { getPeriodSavings, getSavingsBalanceTotal } from "@/modules/accounts";
import { getProfile } from "@/modules/profiles";

export const metadata = { title: "Beranda" };
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
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
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
  const periods = resolveDashboardPeriods(filtersResult.data, now);
  const calendarDays = countCalendarDays(cardInterval);
  const prevCalendarDays = countCalendarDays(prevCardInterval);

  const [
    dailyResult,
    recentResult,
    rollingResult,
    monthlyResult,
    chartMonthlyResult,
    categoryResult,
    totalsResult,
    savingsResult,
    savingsBalanceResult,
  ] = await Promise.allSettled([
    getDailyExpenseAggregates(user.id, cardInterval),
    getDailyExpenseAggregates(user.id, recentInterval),
    getRollingThreeDayTransactions(user.id),
    getMonthlyAggregates(user.id, cardInterval),
    getMonthlyAggregates(user.id, periods.chart),
    getCategoryExpenseAggregates(user.id, cardInterval),
    getSelectedAndPreviousTotals(user.id, cardInterval, prevCardInterval),
    getPeriodSavings(user.id, cardInterval.start, cardInterval.end),
    getSavingsBalanceTotal(user.id),
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

  const chartContract = buildMonthlyChartContract(
    periods.chartMonthKeys,
    isFulfilled(chartMonthlyResult) ? chartMonthlyResult.value : [],
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

  return (
    <div className="grid gap-3 min-[861px]:grid-cols-8 min-[1024px]:grid-cols-12">
      <div className="min-w-0 min-[861px]:col-span-4 min-[1024px]:col-span-6">
        <FinancialOverview
          name={profile?.displayName ?? "Pengguna Spenles"}
          income={overview.income.toString()}
          expense={overview.expense.toString()}
          net={(overview.income - overview.expense).toString()}
        />
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
          />
        ) : (
          <DashboardSectionError title="Pengeluaran bulanan belum tersedia" />
        )}
      </div>

      <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-6">
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

      <div className="hidden min-w-0 min-[861px]:col-span-5 min-[861px]:block min-[1024px]:col-span-8">
        {isFulfilled(chartMonthlyResult) ? (
          <CashFlowOverviewCard
            points={chartContract.incomeExpensePoints}
            totalIncome={chartContract.totalIncome}
            totalExpense={chartContract.totalExpense}
          />
        ) : (
          <DashboardSectionError title="Grafik arus kas belum tersedia" />
        )}
      </div>

      <div className="hidden min-w-0 min-[861px]:col-span-3 min-[861px]:block min-[1024px]:col-span-4">
        {totals ? (
          <AverageSpendingCard
            value={averageDaily}
            changeBps={averageComparison.changeBps}
            previousLabel={prevCardInterval.label}
          />
        ) : (
          <DashboardSectionError title="Rata-rata harian belum tersedia" />
        )}
      </div>

      <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-6">
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

      <div className="hidden min-w-0 min-[861px]:col-span-4 min-[861px]:block min-[1024px]:col-span-6">
        {isFulfilled(categoryResult) ? (
          <TopSpendingCard
            periodLabel={monthLabelFor(cardMonth)}
            rows={categoryRows}
          />
        ) : (
          <DashboardSectionError title="Kategori teratas belum tersedia" />
        )}
      </div>

      <div className="hidden min-w-0 min-[861px]:col-span-3 min-[861px]:block min-[1024px]:col-span-5">
        {isFulfilled(savingsResult) && isFulfilled(savingsBalanceResult) ? (
          <SavingsSummaryCard
            balance={savingsBalance}
            periodNet={savingsNet}
          />
        ) : (
          <DashboardSectionError title="Ringkasan tabungan belum tersedia" />
        )}
      </div>

      <div className="min-w-0 min-[861px]:col-span-5 min-[1024px]:col-span-7">
        {isFulfilled(rollingResult) ? (
          <RollingThreeDayTransactions rows={rollingResult.value} />
        ) : (
          <DashboardSectionError title="Aktivitas terbaru belum tersedia" />
        )}
      </div>

      <DashboardFeatureGrid />
    </div>
  );
}