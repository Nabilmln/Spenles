"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatIdr } from "@/lib/money/format-idr";

const PRIVACY_MASK = "••••••";

export function AccountTotalCard({ total }: { total: bigint }) {
  const [hidden, setHidden] = useState(false);

  return (
    <section
      aria-label="Total amount across accounts"
      className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-border bg-surface px-[1.1rem] py-[.9rem] shadow-card"
    >
      <p className="m-0 min-w-0 text-[.82rem] font-medium text-muted">
        Total Amount
      </p>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <strong className="min-w-0 truncate text-[.98rem] tracking-[-.01em] [overflow-wrap:anywhere]">
          {hidden ? PRIVACY_MASK : formatIdr(total)}
        </strong>
        <button
          type="button"
          className="grid size-[2.2rem] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface-subtle text-muted transition-colors hover:bg-primary-50 hover:text-primary-600"
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
    </section>
  );
}