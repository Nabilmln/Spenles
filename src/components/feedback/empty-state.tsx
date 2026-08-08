import type { ReactNode } from "react";
import { CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { emptyActionClass, emptyIconClass, emptyStateClass } from "../ui/styles";

export function EmptyState({
  title = "Belum ada aktivitas keuangan",
  description = "Mulai dengan mencatat pemasukan atau pengeluaran pertama Anda.",
  icon,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(emptyStateClass, className)}>
      <span className={emptyIconClass}>{icon ?? <CircleDollarSign size={28} aria-hidden="true" />}</span>
      <div>
        <h2 className="mb-[.3rem] text-base">{title}</h2>
        <p className="m-0 text-[.9rem] text-muted">{description}</p>
        {action ? <div className={emptyActionClass}>{action}</div> : null}
      </div>
    </div>
  );
}
