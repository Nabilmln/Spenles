"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { SplitBillFilters } from "../schemas/split-bill-filters";

export function activeSplitBillFilterCount(filters: SplitBillFilters) {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.status && filters.status !== "all") count += 1;
  if (filters.month) count += 1;
  if (filters.sort !== "billDate") count += 1;
  if (filters.direction !== "desc") count += 1;
  return count;
}

export function SplitBillFilterBar({
  filters,
}: {
  filters: SplitBillFilters;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(filters.status ?? "");
  const [month, setMonth] = useState(filters.month ?? "");
  const [sort, setSort] = useState(filters.sort);
  const [direction, setDirection] = useState(filters.direction);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const count = activeSplitBillFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  return (
    <form
      className="tx-filter-bar"
      id="split-bill-filters-form"
      method="get"
      role="search"
    >
      <input
        aria-label="Cari merchant"
        className="input tx-search-input"
        defaultValue={filters.q}
        name="q"
        placeholder="Cari merchant"
        type="search"
      />
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Buka filter"
        className="icon-button tx-filter-button"
        onClick={() => setOpen(true)}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={19} />
        {count > 0 ? <span className="tx-filter-count">{count}</span> : null}
      </button>
      <input name="status" type="hidden" value={status} />
      <input name="month" type="hidden" value={month} />
      <input name="sort" type="hidden" value={sort} />
      <input name="direction" type="hidden" value={direction} />
      <input name="pageSize" type="hidden" value={filters.pageSize} />

      {open ? (
        <div className="tx-sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            aria-labelledby="split-filter-title"
            aria-modal="true"
            className="tx-filter-sheet"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            role="dialog"
          >
            <div className="tx-sheet-header">
              <h2 id="split-filter-title">Filter Split Bill</h2>
              <button
                aria-label="Tutup filter"
                className="icon-button"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="tx-sheet-fields">
              <label className="field">
                <span>Status</span>
                <select
                  aria-label="Status"
                  className="input"
                  onChange={(event) => setStatus(event.target.value)}
                  value={status}
                >
                  <option value="">Aktif</option>
                  <option value="draft">Draft</option>
                  <option value="finalized">Final</option>
                  <option value="archived">Arsip</option>
                  <option value="all">Semua</option>
                </select>
              </label>
              <label className="field">
                <span>Bulan tagihan</span>
                <input
                  aria-label="Bulan tagihan"
                  className="input"
                  onChange={(event) => setMonth(event.target.value)}
                  type="month"
                  value={month}
                />
              </label>
              <label className="field">
                <span>Urutkan</span>
                <select
                  aria-label="Urutkan"
                  className="input"
                  onChange={(event) =>
                    setSort(event.target.value as SplitBillFilters["sort"])
                  }
                  value={sort}
                >
                  <option value="billDate">Tanggal</option>
                  <option value="amount">Nominal</option>
                </select>
              </label>
              <label className="field">
                <span>Arah urutan</span>
                <select
                  aria-label="Arah urutan"
                  className="input"
                  onChange={(event) =>
                    setDirection(
                      event.target.value as SplitBillFilters["direction"],
                    )
                  }
                  value={direction}
                >
                  <option value="desc">Terbaru dahulu</option>
                  <option value="asc">Terlama dahulu</option>
                </select>
              </label>
            </div>
            <div className="tx-sheet-actions">
              <Link className="button button-secondary" href="/split-bills">
                Reset
              </Link>
              <button className="button button-primary" type="submit">
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
