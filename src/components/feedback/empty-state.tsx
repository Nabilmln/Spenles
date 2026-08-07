import type { ReactNode } from "react";
import { CircleDollarSign } from "lucide-react";

export function EmptyState({
  title = "Belum ada aktivitas keuangan",
  description = "Mulai dengan mencatat pemasukan atau pengeluaran pertama Anda.",
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon ?? <CircleDollarSign size={28} aria-hidden="true" />}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
        {action ? <div className="empty-action">{action}</div> : null}
      </div>
    </div>
  );
}
