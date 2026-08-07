import { requireSessionUser } from "@/lib/auth/require-session";
import {
  getReportAnalysis,
  getReportCategoryBreakdown,
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

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/u;

function currentMonthStart() {
  const today = todayJakartaDate();
  return `${today.slice(0, 7)}-01`;
}

function exportHrefs(from: string, to: string) {
  return {
    pdf: `/api/reports/pdf?period=custom&from=${from}&to=${to}`,
    csv: `/api/exports/transactions.csv?period=custom&from=${from}&to=${to}`,
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const raw = await searchParams;
  const today = todayJakartaDate();
  const from =
    typeof raw.from === "string" && DATE_KEY.test(raw.from) && raw.from <= today
      ? raw.from
      : currentMonthStart();
  const to =
    typeof raw.to === "string" && DATE_KEY.test(raw.to) && raw.to <= today
      ? raw.to
      : today;
  const categoryType =
    raw.categoryType === "income" ? "income" : "expense";

  const [analysis, categoryBreakdown] = await Promise.all([
    getReportAnalysis(user.id, from, to),
    getReportCategoryBreakdown(user.id, from, to, categoryType),
  ]);

  const totals = {
    incomeIdr: analysis.summary.incomeIdr,
    expenseIdr: analysis.summary.expenseIdr,
    netIdr: analysis.summary.netIdr,
  };
  const exports = exportHrefs(from, to);

  return (
    <div className="page-stack reports-page">
      <p className="page-description">Pantau pemasukan dan pengeluaran per periode, lalu ekspor laporan bila diperlukan. Semua data privat dari sesi Anda.</p>

      <ReportToolbar
        from={from}
        to={to}
        pdfHref={exports.pdf}
        csvHref={exports.csv}
      />

      <CompactReportSummary totals={totals} />

      <ReportCashFlow
        from={from}
        to={to}
        points={buildCashFlowPoints(analysis.series)}
        incomeIdr={analysis.summary.incomeIdr}
        expenseIdr={analysis.summary.expenseIdr}
        daily={analysis.daily}
      />

      <CategoryAnalysis
        from={from}
        to={to}
        type={categoryType}
        totalIdr={categoryBreakdown.totalIdr}
        categories={categoryBreakdown.categories}
      />

      <ReportInsightCard insight={analysis.insight} />
    </div>
  );
}