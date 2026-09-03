"use client";

import { ChevronRight } from "lucide-react";
import {
  financialCardClass,
  financialCardOrbBottom,
  financialCardOrbTop,
} from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";
import { accountTypeLabel } from "../constants/account-types";
import type { AccountBalanceRow } from "../queries/accounts";

const PRIVACY_MASK = "••••••";

export function AccountCard({
  account,
  hidden = false,
  onDetail,
}: {
  account: AccountBalanceRow;
  hidden?: boolean;
  onDetail: (account: AccountBalanceRow) => void;
}) {
  const active = account.status === "active";
  const negative = BigInt(account.balance) < 0n;

  return (
    <article
      aria-label={`${account.name} account`}
      className={cn(financialCardClass, "gap-[.9rem]")}
    >
      <div aria-hidden="true" className={financialCardOrbTop} />
      <div aria-hidden="true" className={financialCardOrbBottom} />

      <div className="relative z-[1] flex items-start justify-between gap-3">
        <h2 className="m-0 min-w-0 truncate text-[.95rem] tracking-[-.02em]">
          {account.name}
        </h2>
        <span
          className={cn(
            "inline-flex min-h-[1.6rem] shrink-0 items-center rounded-full px-[.55rem] py-[.15rem] whitespace-nowrap text-[.7rem] font-medium",
            active ? "bg-white/20 text-white" : "bg-white/10 text-white/70",
          )}
        >
          {active ? "Active" : "Inactive"}
        </span>
      </div>

      <p className="relative z-[1] m-0 text-[.82rem] text-white/80">
        {accountTypeLabel(account.type)}
      </p>

      <div className="relative z-[1]">
        <p className="m-0 text-[.68rem] font-semibold uppercase tracking-[.08em] text-white/60">
          Balance
        </p>
        <strong
          className={cn(
            "block text-[clamp(1.4rem,6vw,1.8rem)] leading-[1.1] font-semibold tracking-[-.03em] [overflow-wrap:anywhere]",
            hidden && "tracking-[.14em]",
            negative && "text-white",
          )}
        >
          {hidden ? PRIVACY_MASK : formatIdr(account.balance)}
        </strong>
      </div>

      <div className="relative z-[1] flex items-center justify-end border-t border-white/15 pt-[.7rem]">
        <button
          type="button"
          className="inline-flex min-h-[2.2rem] cursor-pointer items-center gap-[.25rem] rounded-[.6rem] border-0 bg-white/12 px-[.55rem] text-[.82rem] font-medium text-white transition-colors hover:bg-white/20"
          onClick={() => onDetail(account)}
          aria-label={`Open details for ${account.name}`}
        >
          Detail
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}