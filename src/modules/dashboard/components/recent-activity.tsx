import { cardClass } from "@/components/ui/styles";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { RecordExpenseButton } from "./record-expense-button";
import type { RecentDashboardTransaction } from "../types/dashboard";

const MAX_ITEMS = 5;

export function RecentActivityCard({
  rows,
}: {
  rows: RecentDashboardTransaction[];
}) {
  const recentRows = rows.slice(0, MAX_ITEMS);

  return (
    <section aria-labelledby="recent-activity-title" className={`${cardClass} flex h-full flex-col shadow-none`}>
      <h2 id="recent-activity-title" className="m-0! mb-[.65rem]! text-[1.175rem]! font-semibold tracking-[-.02em]">Recent Activity</h2>

      {recentRows.length ? (
        <div className="grid flex-1 gap-[.6rem]">
          {recentRows.map((row) => (
            <TransactionCard
              compact
              key={row.id}
              transaction={{
                id: row.id,
                type: row.type,
                amount: row.amountIdr,
                transactionAt: row.transactionAt,
                note: row.note,
                categoryName: row.categoryName,
                categoryId: row.categoryId,
                categoryIcon: row.categoryIcon,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="mt-3 grid min-h-[5rem] flex-1 place-items-center rounded-[1.05rem] border border-dashed border-border bg-surface-subtle p-4 text-center"
          role="status"
        >
          <div className="grid gap-[.2rem]">
            <p className="m-0 text-[.85rem] font-medium text-foreground">No expenses yet</p>
            <p className="m-0 text-[.78rem] text-muted">Start recording your first expense.</p>
            <RecordExpenseButton />
          </div>
        </div>
      )}
    </section>
  );
}
