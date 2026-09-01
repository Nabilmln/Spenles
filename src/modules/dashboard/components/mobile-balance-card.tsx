"use client";

import { Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

export function MobileBalanceCard({
  name,
  balance,
  income,
  expense,
}: {
  name: string;
  balance: bigint;
  income: bigint;
  expense: bigint;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <section aria-label="Total balance" className="grid min-w-0 gap-[.5rem]">
      <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[.14em] text-muted">
        Total balance
      </p>
      <div className="flex items-center gap-[.6rem]">
        <h2
          className={cn(
            "m-0 min-w-0 text-[clamp(1.7rem,9vw,2.4rem)] leading-[1.05] font-semibold tracking-[-.04em] [overflow-wrap:anywhere]",
            hidden && "tracking-[.14em]",
          )}
        >
          {hidden ? PRIVACY_MASK : formatIdr(balance)}
        </h2>
        <button
          type="button"
          className="grid size-[2.2rem] shrink-0 place-items-center rounded-full bg-surface-subtle text-muted transition-colors hover:text-foreground"
          aria-label={hidden ? "Show amount" : "Hide amount"}
          aria-pressed={hidden}
          onClick={() => setHidden((value) => !value)}
        >
          {hidden ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="mt-[.35rem] flex items-center gap-[.5rem] text-[.8rem] text-muted">
        <Wallet size={14} aria-hidden="true" />
        <span className="min-w-0 truncate">{name}</span>
      </div>

      <div className="mt-[1.1rem] grid grid-cols-2 gap-[.6rem]">
        <div className="rounded-[.85rem] bg-surface-subtle/70 p-[.7rem_.8rem]">
          <p className="m-0 text-[.68rem] font-semibold uppercase tracking-[.08em] text-muted">
            Income
          </p>
          <strong className="block text-[.95rem] leading-[1.2] text-income [overflow-wrap:anywhere]">
            {hidden ? PRIVACY_MASK : formatIdr(income)}
          </strong>
        </div>
        <div className="rounded-[.85rem] bg-surface-subtle/70 p-[.7rem_.8rem]">
          <p className="m-0 text-[.68rem] font-semibold uppercase tracking-[.08em] text-muted">
            Expense
          </p>
          <strong className="block text-[.95rem] leading-[1.2] text-expense [overflow-wrap:anywhere]">
            {hidden ? PRIVACY_MASK : formatIdr(expense)}
          </strong>
        </div>
      </div>
    </section>
  );
}