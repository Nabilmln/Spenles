import { MoreHorizontal, ReceiptText } from "lucide-react";
import { formatLongDateUtc } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";
import { ParticipantAvatarStack } from "./participant-avatar-stack";

const statusLabel = {
  draft: "DRAFT",
  finalized: "FINAL",
} as const;

const statusBadgeClass = {
  draft: "text-[#b45309] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  finalized: "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]",
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
    <article className="grid items-center gap-[.8rem] rounded-[1.15rem] border border-border bg-surface p-[.85rem] grid-cols-[auto_minmax(0,1fr)_auto_auto]">
      <span className="relative shrink-0">
        <span className="grid size-[2.7rem] place-items-center rounded-full text-primary-600 bg-[color-mix(in_srgb,var(--primary-600)_10%,transparent)]">
          <ReceiptText size={20} aria-hidden="true" />
        </span>
        <span
          className={cn(
            "absolute -top-[.4rem] -left-[.4rem] rounded-full px-[.4rem] py-[.12rem] whitespace-nowrap text-[.58rem] font-semibold leading-none ring-2 ring-surface",
            statusBadgeClass[row.status],
          )}
        >
          {statusLabel[row.status]}
        </span>
      </span>

      <div className="grid min-w-0 gap-[.15rem]">
        <strong className="text-[.9rem] font-semibold [overflow-wrap:anywhere]">
          {row.merchantName}
        </strong>
        <ParticipantAvatarStack
          names={row.participantNames}
          count={row.participantCount}
        />
      </div>

      <div className="grid min-w-0 justify-items-end gap-[.15rem] text-right">
        {row.finalAmount ? (
          <strong className="max-w-[7rem] text-[.85rem] font-semibold tabular-nums [overflow-wrap:anywhere] text-foreground">
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
        className="grid size-[2.4rem] shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-primary-600"
        aria-label="Split bill actions"
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
    </article>
  );
}
