import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  buildDailyExpenseChartContract,
  currentJakartaMonthKey,
  DashboardFeatureGrid,
  getDailyExpenseAggregates,
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
      <div className="page-stack">
        <SectionHeading
          description="Parameter periode tidak dapat digunakan."
          eyebrow="Dashboard"
          title="Periode tidak valid"
        />
        <section className="dashboard-section-error card" role="alert">
          <div>
            <h2>Periksa pilihan periode</h2>
            <p>{filtersResult.error}</p>
          </div>
          <Link className="button button-primary" href="/dashboard">
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
  const [dailyResult, rollingResult] = await Promise.allSettled([
    getDailyExpenseAggregates(user.id, cardInterval),
    getRollingThreeDayTransactions(user.id),
  ]);
  const daily = isFulfilled(dailyResult)
    ? buildDailyExpenseChartContract(cardInterval, dailyResult.value)
    : null;

  return (
    <div className="page-stack dashboard-page">
      <div className="dashboard-hero">
        <SectionHeading
          description="Ringkasan pribadi dalam IDR dengan batas waktu Asia/Jakarta."
          eyebrow="Dashboard"
          title={`Halo, ${profile?.displayName ?? "Pengguna Spenles"}!`}
        />
        <Link className="button button-primary" href="/transactions/new">
          Tambah transaksi
        </Link>
      </div>

      {daily ? (
        <MonthlyExpenseCard
          currentMonth={cardMonth}
          monthLabel={monthLabelFor(cardMonth)}
          nextMonth={shiftMonthKey(cardMonth, 1)}
          points={daily.points}
          prevMonth={shiftMonthKey(cardMonth, -1)}
          totalExpense={daily.totalExpense}
        />
      ) : (
        <div className="dashboard-section-error card" role="alert">
          <div>
            <h2>Pengeluaran bulanan belum tersedia</h2>
            <p>Silakan muat ulang halaman untuk mencoba lagi.</p>
          </div>
        </div>
      )}

      <DashboardFeatureGrid />

      {isFulfilled(rollingResult) ? (
        <RollingThreeDayTransactions rows={rollingResult.value} />
      ) : (
        <div className="dashboard-section-error card" role="alert">
          <div>
            <h2>Aktivitas terbaru belum tersedia</h2>
            <p>Silakan muat ulang halaman untuk mencoba lagi.</p>
          </div>
        </div>
      )}
    </div>
  );
}
