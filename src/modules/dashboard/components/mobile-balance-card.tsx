"use client";

import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

export function MobileBalanceCard({
  balance,
}: {
  balance: bigint;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <section aria-label="Balance" className="mx-auto w-full max-w-[30rem] overflow-hidden">
      <div className="relative aspect-[3/2] w-full text-white">
        <Image
          src="/illustrations/cardholder-clean-v2.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 860px) 100vw, 0px"
          className="pointer-events-none scale-[1.18] object-contain"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[10%] top-[10%] text-[clamp(.7rem,3.8vw,1rem)] font-black italic tracking-[-.04em] text-white/90"
        >
          VISA
        </span>

        <div className="absolute bottom-[13%] left-[11%] right-[11%] min-w-0">
          <p className="m-0 text-[.72rem] font-medium text-white/80">
            Balance:
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <h2
              className={cn(
                "m-0 min-w-0 text-[clamp(1.35rem,7vw,2rem)] leading-[1.1] font-semibold tracking-[-.035em] tabular-nums [overflow-wrap:anywhere]",
                hidden && "tracking-[.12em]",
              )}
            >
              {hidden ? PRIVACY_MASK : formatIdr(balance)}
            </h2>
            <button
              type="button"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
        </div>
      </div>
    </section>
  );
}
