import { TrendingDown } from "lucide-react";
import { formatIdr } from "@/lib/money/format-idr";

export type ReportInsightData = {
  averageDailyExpenseIdr: string;
  inclusiveDays: number;
};

export function ReportInsightCard({
  insight,
}: {
  insight: ReportInsightData;
}) {
  return (
    <section aria-label="Wawasan keuangan" className="card report-insight-card">
      <div className="report-insight-icon" aria-hidden="true">
        <TrendingDown size={22} />
      </div>
      <div className="report-insight-copy">
        <h2>Wawasan</h2>
        <p>
          Rata-rata pengeluaran per hari kamu adalah{" "}
          <strong>{formatIdr(insight.averageDailyExpenseIdr)}</strong>
        </p>
      </div>
    </section>
  );
}