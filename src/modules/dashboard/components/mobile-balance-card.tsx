"use client";

import Image from "next/image";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

export function MobileBalanceCard({
  accounts,
  balance,
  income,
  expense,
}: {
  accounts: { name: string; type: string }[];
  balance: bigint;
  income: bigint;
  expense: bigint;
}) {
  const [hidden, setHidden] = useState(false);
  const accountLabel =
    accounts.length === 1
      ? accounts[0]!.name
      : accounts.length > 1
        ? `${accounts[0]!.name} +${accounts.length - 1} more`
        : "No accounts yet";

  return (
    <section
      aria-label="Total balance"
      className="relative grid min-w-0 gap-[1rem] overflow-hidden rounded-[1.25rem] bg-[#171717] p-[1.25rem] text-white shadow-[0_12px_36px_rgb(23_23_23/20%)]"
    >
      {accounts.length > 0 ? (
        <Image
          src="/illustrations/cardholder-graphite.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 860px) 100vw, 0px"
          className="pointer-events-none object-cover opacity-85"
        />
      ) : null}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/10" />

      <div className="relative z-[1] flex items-center justify-between gap-3">
        <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[.14em] text-white/70">
          Total balance
        </p>
        <button
          type="button"
          className="grid size-[2.4rem] shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label={hidden ? "Show amount" : "Hide amount"}
          aria-pressed={hidden}
          onClick={() => setHidden((value) => !value)}
        >
          {hidden ? (
            <EyeOff size={17} aria-hidden="true" />
          ) : (
            <Eye size={17} aria-hidden="true" />
          )}
        </button>
      </div>

      <h2
        className={cn(
          "relative z-[1] m-0 min-w-0 text-[clamp(1.9rem,10vw,2.6rem)] leading-[1.05] font-semibold tracking-[-.04em] [overflow-wrap:anywhere]",
          hidden && "tracking-[.14em]",
        )}
      >
        {hidden ? PRIVACY_MASK : formatIdr(balance)}
      </h2>

      <div className="relative z-[1] flex items-center gap-[.5rem] text-[.82rem] text-white/75">
        <Wallet size={15} aria-hidden="true" />
        <span className="min-w-0 truncate">{accountLabel}</span>
      </div>

      <div className="relative z-[1] grid grid-cols-2 gap-[.7rem] border-t border-white/15 pt-[1rem]">
        <div>
          <p className="m-0 text-[.68rem] font-semibold uppercase tracking-[.08em] text-white/60">
            Income
          </p>
          <strong className="block text-[.98rem] leading-[1.2] text-white [overflow-wrap:anywhere]">
            {hidden ? PRIVACY_MASK : formatIdr(income)}
          </strong>
        </div>
        <div>
          <p className="m-0 text-[.68rem] font-semibold uppercase tracking-[.08em] text-white/60">
            Expense
          </p>
          <strong className="block text-[.98rem] leading-[1.2] text-white [overflow-wrap:anywhere]">
            {hidden ? PRIVACY_MASK : formatIdr(expense)}
          </strong>
        </div>
      </div>
    </section>
  );
}
