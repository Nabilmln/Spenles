"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
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
      className="card report-category-card"
    >
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">{type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
          <h2 id="report-categories-title">{title}</h2>
        </div>
        <button
          aria-haspopup="dialog"
          aria-label="Buka filter kategori"
          className="icon-button"
          onClick={() => setOpen(true)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" size={19} />
        </button>
      </div>

      {categories.length ? (
        <div className="report-category-list">
          {categories.map((category) => {
            const share = percent(category.amountIdr, total);
            return (
              <Link
                className="report-category-row"
                href={`/reports/categories/${category.categoryId}?from=${from}&to=${to}`}
                key={category.categoryId}
              >
                <span>{category.name}</span>
                <span className="report-category-bar" aria-hidden="true">
                  <i style={{ width: `${Math.min(share, 100)}%` }} />
                </span>
                <strong>{formatIdr(category.amountIdr)}</strong>
                <small>{share.toLocaleString("id-ID")}%</small>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-inline-empty" role="status">
          Belum ada {type === "income" ? "pemasukan" : "pengeluaran"} pada periode ini.
        </div>
      )}

      {open ? (
        <div className="report-sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            aria-labelledby="report-cf-title"
            aria-modal="true"
            className="report-sheet-panel report-category-filter"
            role="dialog"
          >
            <div className="report-sheet-header">
              <h2 id="report-cf-title">Filter kategori</h2>
              <button
                aria-label="Tutup filter kategori"
                className="icon-button"
                onClick={() => setOpen(false)}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div
              className="report-category-type-options"
              role="group"
              aria-label="Jenis transaksi"
            >
              <button
                aria-pressed={type === "expense"}
                className={type === "expense" ? "report-cat-option report-cat-active" : "report-cat-option"}
                onClick={() => select("expense")}
                type="button"
              >
                Pengeluaran
              </button>
              <button
                aria-pressed={type === "income"}
                className={type === "income" ? "report-cat-option report-cat-active" : "report-cat-option"}
                onClick={() => select("income")}
                type="button"
              >
                Pemasukan
              </button>
            </div>
            <p className="financial-disclaimer">
              Periode mengikuti rentang utama laporan: {formatReportRange(from, to)}.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}