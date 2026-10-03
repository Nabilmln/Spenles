import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
import {
  getReportAnalysis,
  getReportCategoryBreakdown,
  getReportOptions,
  parseReportParams,
  todayJakartaDate,
} from "@/modules/reports";
import {
  buildCashFlowPoints,
  CategoryAnalysis,
  CompactReportSummary,
  ReportCashFlow,
  ReportInsightCard,
  ReportToolbar,
} from "@/modules/reports/components";

export const maxDuration = 30;

function currentMonthStart() {
  const today = todayJakartaDate();
  return `${today.slice(0, 7)}-01`;
}

function currentMonthEnd(today: string) {
  const [year, month] = today.slice(0, 7).split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const raw = await searchParams;
  const today = todayJakartaDate();
  const defaultFrom = currentMonthStart();
  const defaultTo = currentMonthEnd(today);
  const selectedRange = parseReportParams(new URLSearchParams({
    period: "custom",
    from: typeof raw.from === "string" ? raw.from : defaultFrom,
    to: typeof raw.to === "string" ? raw.to : defaultTo,
  }));
  const from = selectedRange?.interval.startDate ?? defaultFrom;
  const to = selectedRange?.interval.endDate ?? defaultTo;
  const categoryType =
    raw.categoryType === "income" ? "income" : "expense";

  const analysis = await getReportAnalysis(user.id, from, to);
  const reportOptions = await getReportOptions(user.id);
  const categoryBreakdown = await getReportCategoryBreakdown(
    user.id,
    from,
    to,
    categoryType,
    categoryType === "income"
      ? analysis.summary.incomeIdr
      : analysis.summary.expenseIdr,
  );

  const totals = {
    incomeIdr: analysis.summary.incomeIdr,
    expenseIdr: analysis.summary.expenseIdr,
    netIdr: analysis.summary.netIdr,
  };
  return (
    <div className={`${pageStackClass} max-w-[78rem]`}>
      <ReportToolbar
        from={from}
        to={to}
        email={user.email ?? ""}
        accounts={reportOptions.accounts}
      />

      <CompactReportSummary totals={totals} />

      <ReportCashFlow points={buildCashFlowPoints(analysis.series, { from, to, daily: analysis.daily })} from={from} to={to} />

      <ReportInsightCard insight={analysis.insight} />

      <CategoryAnalysis
        from={from}
        to={to}
        type={categoryType}
        totalIdr={categoryBreakdown.totalIdr}
        categories={categoryBreakdown.categories}
      />
    </div>
  );
}
