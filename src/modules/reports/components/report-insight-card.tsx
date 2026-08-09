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
    <section aria-label="Wawasan keuangan" className={cn(cardClass, "grid grid-cols-[30%_70%] items-center gap-4 max-[720px]:grid-cols-[6.5rem_1fr]")}>
      <div className="grid size-[3.2rem] place-items-center justify-self-center rounded-full bg-primary-50 text-primary-600" aria-hidden="true">
        <TrendingDown size={22} />
      </div>
      <div>
        <h2 className="m-0 mb-1 text-[1.02rem]">Wawasan</h2>
        <p className="m-0 text-[.9rem] leading-normal text-muted">
          Rata-rata pengeluaran per hari kamu adalah{" "}
          <strong className="text-foreground">{formatIdr(insight.averageDailyExpenseIdr)}</strong>
        </p>
      </div>
    </section>
  );
}
