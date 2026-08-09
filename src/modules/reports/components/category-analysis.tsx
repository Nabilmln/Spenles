"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { cardClass, eyebrowClass, iconButtonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { formatIdr } from "@/lib/money/format-idr";
import { formatReportRange } from "../lib/report-date";

export type CategoryBreakdownItem = {
  categoryId: string;
  name: string;
  amountIdr: string;
  shareBps: number;
};

function percent(amount: string, total: bigint) {
  return total === 0n ? 0 : Number((BigInt(amount) * 10_000n) / total) / 100;
}

export function CategoryAnalysis({
  from,
  to,
  type,
  totalIdr,
  categories,
}: {
  from: string;
  to: string;
  type: "income" | "expense";
  totalIdr: string;
  categories: CategoryBreakdownItem[];
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = BigInt(totalIdr);
  const title =
    type === "income" ? "Pemasukan per Kategori" : "Pengeluaran per Kategori";

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function select(nextType: "income" | "expense") {
    const url = new URL(window.location.href);
    url.searchParams.set("categoryType", nextType);
    window.location.href = url.toString();
  }

  return (
    <section
      aria-labelledby="report-categories-title"
      className={cn(cardClass, "shadow-none")}
    >
      <div className="mb-4 flex items-start justify-between gap-4 max-[540px]:flex-col">
        <div>
          <p className={eyebrowClass}>{type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
          <h2 id="report-categories-title" className="m-0 text-[1.08rem] tracking-[-.02em]">{title}</h2>
        </div>
        <button
          aria-haspopup="dialog"
          aria-label="Buka filter kategori"
          className={iconButtonClass}
          onClick={() => setOpen(true)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={19} />
        </button>
      </div>

      {categories.length ? (
        <div className="grid">
          {categories.map((category) => {
            const share = percent(category.amountIdr, total);
            return (
              <Link
                className="grid grid-cols-[minmax(8rem,1fr)_minmax(6rem,2fr)_auto_auto] items-center gap-[.9rem] border-b border-border p-[.8rem_0] last:border-b-0 max-[720px]:grid-cols-[minmax(0,1fr)_auto]"
                href={`/reports/categories/${category.categoryId}?from=${from}&to=${to}`}
                key={category.categoryId}
              >
                <span>{category.name}</span>
                <span className="h-[.55rem] overflow-hidden rounded-full bg-surface-subtle max-[720px]:col-span-full max-[720px]:row-start-2" aria-hidden="true">
                  <i className="block h-full rounded-[inherit] bg-primary-600" style={{ width: `${Math.min(share, 100)}%` }} />
                </span>
                <strong>{formatIdr(category.amountIdr)}</strong>
                <small className="text-[.78rem] text-muted">{share.toLocaleString("id-ID")}%</small>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid min-h-[10rem] place-items-center rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-4 text-center text-[.84rem] text-muted" role="status">
          Belum ada {type === "income" ? "pemasukan" : "pengeluaran"} pada periode ini.
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-[rgb(15_17_21/55%)] p-4" onClick={() => setOpen(false)}>
          <div
            aria-labelledby="report-cf-title"
            aria-modal="true"
            className="w-full max-w-[30rem] max-h-[86vh] overflow-y-auto border border-border bg-surface p-[1.25rem] rounded-[1.1rem] shadow-card"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-[.75rem]">
              <h2 id="report-cf-title" className="m-0 text-[1.08rem]">Filter kategori</h2>
              <button
                aria-label="Tutup filter kategori"
                className={iconButtonClass}
                onClick={() => setOpen(false)}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div
              className="flex gap-[.5rem]"
              role="group"
              aria-label="Jenis transaksi"
            >
              <button
                aria-pressed={type === "expense"}
                className={cn(
                  "flex-1 min-h-[2.85rem] cursor-pointer rounded-[.7rem] border border-border bg-surface-subtle p-[.55rem_.7rem] font-medium text-muted",
                  type === "expense" && "border-primary-600 bg-primary-600 text-white",
                )}
                onClick={() => select("expense")}
                type="button"
              >
                Pengeluaran
              </button>
              <button
                aria-pressed={type === "income"}
                className={cn(
                  "flex-1 min-h-[2.85rem] cursor-pointer rounded-[.7rem] border border-border bg-surface-subtle p-[.55rem_.7rem] font-medium text-muted",
                  type === "income" && "border-primary-600 bg-primary-600 text-white",
                )}
                onClick={() => select("income")}
                type="button"
              >
                Pemasukan
              </button>
            </div>
            <p className="mt-4 rounded-[.7rem] bg-surface-subtle p-3 text-[.76rem] text-muted">
              Periode mengikuti rentang utama laporan: {formatReportRange(from, to)}.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
