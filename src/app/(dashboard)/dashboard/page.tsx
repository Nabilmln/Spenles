import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  buildDailyExpenseChartContract,
  buildFourDayExpenseChartContract,
  currentJakartaMonthKey,
  DashboardFeatureGrid,
  FinancialOverview,
  fourDayJakartaInterval,
  getDailyExpenseAggregates,
  getMonthlyAggregates,
  getRollingThreeDayTransactions,
  MonthlyExpenseCard,
  monthIntervalForKey,
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
            <h2>Periksa pilihan periode</h2>
            <p>{filtersResult.error}</p>
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
  const now = new Date();
  const recentInterval = fourDayJakartaInterval(now);
  const [dailyResult, recentResult, rollingResult, monthlyResult] =
    await Promise.allSettled([
      getDailyExpenseAggregates(user.id, cardInterval),
      getDailyExpenseAggregates(user.id, recentInterval),
      getRollingThreeDayTransactions(user.id),
      getMonthlyAggregates(user.id, cardInterval),
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

  return (
    <div className="grid gap-8">
      <FinancialOverview
        name={profile?.displayName ?? "Pengguna Spenles"}
        income={overview.income.toString()}
        expense={overview.expense.toString()}
      />

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
        <div className={`${cardClass} flex items-center gap-[.8rem] shadow-none`} role="alert">
          <div>
            <h2 className="m-[0_0_.25rem]! text-base!">Pengeluaran bulanan belum tersedia</h2>
            <p className="m-0 text-muted text-[.84rem]">Silakan muat ulang halaman untuk mencoba lagi.</p>
          </div>
        </div>
      )}

      <DashboardFeatureGrid />

      {isFulfilled(rollingResult) ? (
        <RollingThreeDayTransactions rows={rollingResult.value} />
      ) : (
        <div className={`${cardClass} flex items-center gap-[.8rem] shadow-none`} role="alert">
          <div>
            <h2 className="m-[0_0_.25rem]! text-base!">Aktivitas terbaru belum tersedia</h2>
            <p className="m-0 text-muted text-[.84rem]">Silakan muat ulang halaman untuk mencoba lagi.</p>
          </div>
        </div>
      )}
    </div>
  );
}
