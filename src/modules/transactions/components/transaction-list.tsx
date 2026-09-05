import { EmptyState } from "@/components/feedback/empty-state";
import { TransactionCard, type TransactionCardRow } from "./transaction-card";

export function TransactionList({ rows }: { rows: TransactionCardRow[] }) {
  if (!rows.length) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Transactions you record will appear here."
      />
    );
  }
  return (
    <div className="grid gap-[.75rem]">
      {rows.map((row) => (
        <TransactionCard key={row.id} transaction={row} />
      ))}
    </div>
  );
}