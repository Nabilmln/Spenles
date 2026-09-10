import { MoreHorizontal, ReceiptText } from "lucide-react";
import { formatLongDateUtc } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";
import { ParticipantAvatarStack } from "./participant-avatar-stack";

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

export type SplitBillHistoryRow = {
  id: string;
  merchantName: string;
  billDate: string;
  status: keyof typeof statusLabel;
  finalAmount: string | null;
  participantCount: number;
  participantNames: string[];
};

export function SplitBillHistoryCard({
  row,
  onAction,
}: {
  row: SplitBillHistoryRow;
  onAction: (row: SplitBillHistoryRow) => void;
}) {
  return (
    <article className="grid items-center gap-[.8rem] rounded-[1.1rem] border border-border bg-surface shadow-card p-[.85rem] grid-cols-[auto_minmax(0,1fr)_auto_auto]">
      <span className="grid size-[2.7rem] shrink-0 place-items-center rounded-full text-primary-600 bg-[color-mix(in_srgb,var(--primary-600)_10%,transparent)]">
        <ReceiptText size={20} aria-hidden="true" />
      </span>

      <div className="grid min-w-0 gap-[.15rem]">
        <div className="flex min-w-0 items-center gap-[.4rem]">
          <strong className="min-w-0 flex-1 truncate text-[.9rem]">
            {row.merchantName}
          </strong>
          <span
            className={cn(
              "shrink-0 rounded-full px-[.45rem] py-[.12rem] whitespace-nowrap text-[.65rem] font-medium leading-none",
              statusBadgeClass[row.status],
            )}
          >
            {statusLabel[row.status]}
          </span>
        </div>
        <ParticipantAvatarStack
          names={row.participantNames}
          count={row.participantCount}
        />
      </div>

      <div className="grid justify-items-end gap-[.15rem]">
        {row.finalAmount ? (
          <strong className="whitespace-nowrap text-[.85rem] [overflow-wrap:anywhere] text-foreground">
            {formatIdr(row.finalAmount)}
          </strong>
        ) : null}
        <span className="text-[.7rem] text-muted">
          {formatLongDateUtc(row.billDate)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onAction(row)}
        className="grid size-[2.4rem] shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle"
        aria-label="Split bill actions"
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
    </article>
  );
}