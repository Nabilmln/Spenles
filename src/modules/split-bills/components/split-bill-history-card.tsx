import Link from "next/link";
import { Users } from "lucide-react";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { formatLongDateUtc } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";

const statusLabel = {
  draft: "Draft",
  finalized: "Final",
  archived: "Archived",
};

const statusBadgeClass = {
  draft: "text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  finalized: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
  archived: "text-muted bg-surface-subtle",
};

type SplitBillHistoryRow = {
  id: string;
  merchantName: string;
  billDate: string;
  status: keyof typeof statusLabel;
  finalAmount: string | null;
  participantCount: number;
};

export function SplitBillHistoryCard({
  row,
}: {
  row: SplitBillHistoryRow;
}) {
  return (
    <article
      className={`${cardClass} grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.8rem]`}
    >
      <span className="grid size-[2.7rem] shrink-0 place-items-center rounded-full bg-primary-600/10 text-primary-600">
        <Users size={16} aria-hidden="true" />
      </span>

      <div className="grid min-w-0 gap-[.1rem]">
        <div className="flex min-w-0 items-center gap-[.4rem]">
          <h3 className="min-w-0 flex-1 truncate text-[.9rem] font-semibold">
            {row.merchantName}
          </h3>
          <span
            className={`shrink-0 rounded-full px-[.45rem] py-[.12rem] whitespace-nowrap text-[.65rem] font-medium leading-none ${statusBadgeClass[row.status]}`}
          >
            {statusLabel[row.status]}
          </span>
        </div>
        <span className="truncate text-[.74rem] font-medium text-muted">
          {row.participantCount} participants
        </span>
      </div>

      <div className="grid min-w-0 justify-items-end gap-[.15rem] text-right">
        {row.finalAmount ? (
          <strong className="whitespace-nowrap text-[.85rem] [overflow-wrap:anywhere] text-foreground">
            {formatIdr(row.finalAmount)}
          </strong>
        ) : null}
        <span className="text-[.7rem] text-muted">
          {formatLongDateUtc(row.billDate)}
        </span>
      </div>

      <Link
        className={`col-span-full mt-[.15rem] ${buttonClass("secondary", "w-full justify-center text-[.78rem]")}`}
        href={
          row.status === "draft"
            ? `/split-bills/${row.id}/edit`
            : `/split-bills/${row.id}`
        }
      >
        {row.status === "draft" ? "Continue draft" : "View results"}
      </Link>
    </article>
  );
}