import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  buildCategoryChartContract,
  buildDailyExpenseChartContract,
  buildFinancialSnapshot,
  buildFourDayExpenseChartContract,
  buildMonthlyChartContract,
  CashFlowProfile,
  CategoryExpenseCard,
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
  IncomeExpenseCard,
  MonthlyExpenseCard,
  monthIntervalForKey,
  resolveDashboardPeriods,
  RollingThreeDayTransactions,
  safeParseDashboardFilters,
  shiftMonthKey,
  type DashboardSearchParams,
} from "@/modules/dashboard";
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

  const [
    dailyResult,
    recentResult,
    rollingResult,
    monthlyResult,
    chartMonthlyResult,
    categoryResult,
    totalsResult,
  ] = await Promise.allSettled([
    getDailyExpenseAggregates(user.id, cardInterval),
    getDailyExpenseAggregates(user.id, recentInterval),
    getRollingThreeDayTransactions(user.id),
    getMonthlyAggregates(user.id, cardInterval),
    getMonthlyAggregates(user.id, periods.chart),
    getCategoryExpenseAggregates(user.id, cardInterval),
    getSelectedAndPreviousTotals(user.id, cardInterval, prevCardInterval),
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

  const snapshot =
    isFulfilled(totalsResult) && isFulfilled(monthlyResult)
      ? buildFinancialSnapshot(
          totalsResult.value.selected,
          totalsResult.value.previous,
          monthlyResult.value,
          categoryRows,
          1,
        )
      : null;

  return (
    <div className="grid gap-8 min-[861px]:grid-cols-8 min-[1024px]:grid-cols-12">
      <div className="min-w-0 min-[861px]:col-span-8 min-[1024px]:col-span-5">
        <FinancialOverview
          name={profile?.displayName ?? "Pengguna Spenles"}
          income={overview.income.toString()}
          expense={overview.expense.toString()}
          net={(overview.income - overview.expense).toString()}
        />
      </div>

      <div className="hidden min-w-0 min-[861px]:col-span-8 min-[861px]:block min-[1024px]:col-span-7">
        {isFulfilled(chartMonthlyResult) ? (
          <IncomeExpenseCard
            points={chartContract.incomeExpensePoints}
            totalIncome={chartContract.totalIncome}
            totalExpense={chartContract.totalExpense}
          />
        ) : (
          <DashboardSectionError title="Grafik pemasukan belum tersedia" />
        )}
      </div>

      <div className="min-w-0 min-[861px]:col-span-5 min-[1024px]:col-span-8">
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

      <div className="hidden min-w-0 min-[861px]:col-span-3 min-[861px]:block min-[1024px]:col-span-4">
        {snapshot ? (
          <CashFlowProfile snapshot={snapshot} />
        ) : (
          <DashboardSectionError title="Pola keuangan belum tersedia" />
        )}
      </div>

      <div className="hidden min-w-0 min-[861px]:col-span-5 min-[861px]:block min-[1024px]:col-span-7">
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

      <div className="min-w-0 min-[861px]:col-span-3 min-[1024px]:col-span-5">
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