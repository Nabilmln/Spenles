import { TrendingDown } from "lucide-react";
import { cardClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
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
    <section aria-label="Wawasan keuangan" className={cn(cardClass, "flex items-center gap-4")}>
      <span className="grid size-[2.5rem] shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600" aria-hidden="true">
        <TrendingDown size={18} />
      </span>
      <div className="min-w-0">
        <h2 className="m-0 mb-1 text-[1.02rem]">Wawasan</h2>
        <p className="m-0 text-[.9rem] leading-normal text-muted">
          Rata-rata pengeluaran per hari kamu adalah{" "}
          <strong className="text-foreground">{formatIdr(insight.averageDailyExpenseIdr)}</strong>
        </p>
      </div>
    </section>
  );
}
