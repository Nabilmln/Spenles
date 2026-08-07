"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatIdr } from "@/lib/money/format-idr";
import { cn } from "@/lib/utils";

const PRIVACY_MASK = "••••••";

export function FinancialOverview({
  income,
  expense,
}: {
  income: string;
  expense: string;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <section aria-label="Ringkasan keuangan" className="financial-overview">
      <div className={cn("financial-overview-card", hidden && "financial-overview-hidden")}>
        <div className="financial-overview-head">
          <span className="financial-overview-label">Pendapatan</span>
          <span className="financial-overview-label">Pengeluaran</span>
          <button
            type="button"
            className="icon-button financial-overview-eye"
            aria-label={hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
            aria-pressed={hidden}
            onClick={() => setHidden((value) => !value)}
          >
            {hidden ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="financial-overview-values">
          <strong className="financial-overview-value financial-overview-income">
            {hidden ? PRIVACY_MASK : formatIdr(income)}
          </strong>
          <strong className="financial-overview-value financial-overview-expense">
            {hidden ? PRIVACY_MASK : formatIdr(expense)}
          </strong>
        </div>
      </div>
    </section>
  );
}