import { MoreHorizontal } from "lucide-react";
import { cardClass } from "@/components/ui/styles";
import { formatLongDateUtc } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
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
    <article
      className={`${cardClass} grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-[.55rem]`}
    >
      <div className="grid min-w-0 gap-[.25rem]">
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
        <span className="truncate text-[.7rem] font-medium text-muted">
          {formatLongDateUtc(row.billDate)}
        </span>
        {row.finalAmount ? (
          <strong className="text-[.85rem] font-semibold [overflow-wrap:anywhere] text-foreground">
            {formatIdr(row.finalAmount)}
          </strong>
        ) : null}
        <ParticipantAvatarStack
          names={row.participantNames}
          count={row.participantCount}
        />
      </div>

      <button
        type="button"
        onClick={() => onAction(row)}
        className="grid size-[2.4rem] shrink-0 place-items-center self-start rounded-full text-muted transition-colors hover:bg-surface-subtle"
        aria-label="Split bill actions"
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
    </article>
  );
}