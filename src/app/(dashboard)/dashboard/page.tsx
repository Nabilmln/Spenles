import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { formatIdr } from "@/lib/money/format-idr";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  AccessibleChartTable,
  buildCategoryChartContract,
  buildCategoryVisualPoints,
  buildFinancialSnapshot,
  buildMonthlyChartContract,
  CashFlowProfile,
  CategoryExpenseChart,
  ChartShell,
  DashboardEmptyState,
  DashboardSectionError,
  getCategoryExpenseAggregates,
  getMonthlyAggregates,
  getRecentDashboardTransactions,
  getSelectedAndPreviousTotals,
  IncomeExpenseChart,
  MonthlyExpenseChart,
  PeriodSelector,
  RecentTransactions,
  resolveDashboardPeriods,
  safeParseDashboardFilters,
  SummaryGrid,
  DASHBOARD_TIMEZONE,
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

  const periods = resolveDashboardPeriods(filtersResult.data);
  const analysisTimezone =
    profile?.timezone === DASHBOARD_TIMEZONE
      ? profile.timezone
      : DASHBOARD_TIMEZONE;
  const [
    totalsResult,
    selectedMonthlyResult,
    chartMonthlyResult,
    categoriesResult,
    recentResult,
  ] = await Promise.allSettled([
    getSelectedAndPreviousTotals(user.id, periods.selected, periods.previous),
    getMonthlyAggregates(user.id, periods.selected),
    getMonthlyAggregates(user.id, periods.chart),
    getCategoryExpenseAggregates(user.id, periods.selected),
    getRecentDashboardTransactions(user.id, periods.selected),
  ]);

  const totals = isFulfilled(totalsResult) ? totalsResult.value : null;
  const selectedMonthly = isFulfilled(selectedMonthlyResult)
    ? buildMonthlyChartContract(
        periods.selectedMonthKeys,
        selectedMonthlyResult.value,
      )
    : null;
  const chartMonthly = isFulfilled(chartMonthlyResult)
    ? buildMonthlyChartContract(periods.chartMonthKeys, chartMonthlyResult.value)
    : null;
  const categories = isFulfilled(categoriesResult)
    ? buildCategoryChartContract(categoriesResult.value)
    : null;

  const selectedReconciles =
    totals &&
    selectedMonthly &&
    selectedMonthly.totalIncome === totals.selected.income &&
    selectedMonthly.totalExpense === totals.selected.expense;
  const categoriesReconcile =
    totals && categories && categories.totalExpense === totals.selected.expense;
  const snapshot =
    selectedReconciles && categoriesReconcile
      ? buildFinancialSnapshot(
          totals.selected,
          totals.previous,
          selectedMonthly.filled,
          categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
          periods.selectedMonthKeys.length,
        )
      : null;

  return (
    <div className="page-stack dashboard-page">
      <div className="dashboard-hero">
        <SectionHeading
          description={`Ringkasan pribadi dalam IDR dengan batas waktu ${analysisTimezone}.`}
          eyebrow="Dashboard · Fase 03"
          title={`Halo, ${profile?.displayName ?? "Pengguna Spenles"}`}
        />
        <Link className="button button-primary" href="/transactions/new">
          Tambah transaksi
        </Link>
      </div>

      <PeriodSelector
        defaultMonth={periods.chartMonthKeys.at(-1)!}
        filters={filtersResult.data}
        selectedLabel={periods.selected.label}
      />

      {snapshot ? (
        <>
          <SummaryGrid
            previousLabel={periods.previous.label}
            snapshot={snapshot}
          />
          {snapshot.condition === "no-data" ? <DashboardEmptyState /> : null}
        </>
      ) : (
        <DashboardSectionError title="Ringkasan belum tersedia" />
      )}

      <section aria-labelledby="dashboard-charts-title">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Tren</p>
            <h2 id="dashboard-charts-title">Grafik arus kas</h2>
          </div>
          <p>{periods.chart.label}</p>
        </div>

        {chartMonthly ? (
          <div className="chart-grid">
            <ChartShell
              chart={
                chartMonthly.totalExpense > 0n ? (
                  <MonthlyExpenseChart points={chartMonthly.expensePoints} />
                ) : (
                  <div className="dashboard-inline-empty" role="status">
                    Belum ada pengeluaran pada rentang grafik.
                  </div>
                )
              }
              description="Pengeluaran positif per bulan kalender Jakarta."
              summary={`Total ${formatIdr(chartMonthly.totalExpense)}`}
              table={
                <AccessibleChartTable
                  caption="Pengeluaran bulanan"
                  columns={[
                    { key: "label", label: "Bulan" },
                    { key: "expense", label: "Pengeluaran", align: "right" },
                  ]}
                  rows={chartMonthly.expensePoints.map((point) => ({
                    id: point.period,
                    label: point.label,
                    expense: formatIdr(point.expenseIdr),
                  }))}
                />
              }
              title="Pengeluaran bulanan"
            />
            <ChartShell
              chart={
                chartMonthly.totalIncome > 0n ||
                chartMonthly.totalExpense > 0n ? (
                  <IncomeExpenseChart
                    points={chartMonthly.incomeExpensePoints}
                  />
                ) : (
                  <div className="dashboard-inline-empty" role="status">
                    Belum ada arus kas pada rentang grafik.
                  </div>
                )
              }
              description="Pemasukan dan pengeluaran memakai skala visual yang sama."
              summary={`Pemasukan ${formatIdr(
                chartMonthly.totalIncome,
              )} · Pengeluaran ${formatIdr(chartMonthly.totalExpense)}`}
              table={
                <AccessibleChartTable
                  caption="Perbandingan pemasukan dan pengeluaran"
                  columns={[
                    { key: "label", label: "Bulan" },
                    { key: "income", label: "Pemasukan", align: "right" },
                    { key: "expense", label: "Pengeluaran", align: "right" },
                  ]}
                  rows={chartMonthly.incomeExpensePoints.map((point) => ({
                    id: point.period,
                    label: point.label,
                    income: formatIdr(point.incomeIdr),
                    expense: formatIdr(point.expenseIdr),
                  }))}
                />
              }
              title="Pemasukan vs pengeluaran"
            />
          </div>
        ) : (
          <DashboardSectionError title="Grafik bulanan belum tersedia" />
        )}
      </section>

      <div className="dashboard-detail-grid">
        {categoriesReconcile && categories ? (
          <ChartShell
            chart={
              categories.totalExpense > 0n ? (
                <CategoryExpenseChart
                  points={buildCategoryVisualPoints(categories.points)}
                />
              ) : (
                <div className="dashboard-inline-empty" role="status">
                  Belum ada distribusi pengeluaran pada periode ini.
                </div>
              )
            }
            description="Kategori arsip tetap ditampilkan untuk transaksi historis."
            summary={`Total ${formatIdr(categories.totalExpense)}`}
            table={
              <AccessibleChartTable
                caption="Distribusi pengeluaran per kategori"
                columns={[
                  { key: "rank", label: "Peringkat" },
                  { key: "name", label: "Kategori" },
                  { key: "expense", label: "Pengeluaran", align: "right" },
                  { key: "share", label: "Porsi", align: "right" },
                ]}
                rows={categories.points.map((point) => ({
                  id: point.categoryId,
                  rank: point.rank,
                  name: point.name,
                  expense: formatIdr(point.expenseIdr),
                  share: `${(point.shareBps / 100).toLocaleString("id-ID")}%`,
                }))}
              />
            }
            title="Distribusi kategori"
          />
        ) : (
          <DashboardSectionError title="Distribusi kategori belum tersedia" />
        )}

        {snapshot ? (
          <CashFlowProfile snapshot={snapshot} />
        ) : (
          <DashboardSectionError title="Profil arus kas belum tersedia" />
        )}
      </div>

      {isFulfilled(recentResult) ? (
        <RecentTransactions rows={recentResult.value} />
      ) : (
        <DashboardSectionError title="Transaksi terbaru belum tersedia" />
      )}
    </div>
  );
}
