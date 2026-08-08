"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { buttonClass } from "@/components/ui/styles";
import type { TransactionFilters } from "../schemas/transaction-filters";
import { DateRangeField } from "./date-range-field";

export function activeFilterCount(filters: TransactionFilters) {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.type) count += 1;
  if (filters.category) count += 1;
  if (filters.account) count += 1;
  if (filters.month || filters.from) count += 1;
  if (filters.sort !== "transactionAt") count += 1;
  if (filters.direction !== "desc") count += 1;
  return count;
}

export function TransactionFilterBar({
  filters,
  accounts,
  categories,
}: {
  filters: TransactionFilters;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: "income" | "expense" }[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(filters.type ?? "");
  const [category, setCategory] = useState(filters.category ?? "");
  const [account, setAccount] = useState(filters.account ?? "");
  const [sort, setSort] = useState(filters.sort);
  const [direction, setDirection] = useState(filters.direction);
  const count = activeFilterCount(filters);

  return (
    <form
      className="tx-filter-bar"
      id="transaction-filters-form"
      method="get"
      role="search"
    >
      <input
        aria-label="Cari deskripsi atau kategori"
        className="input tx-search-input"
        defaultValue={filters.q}
        name="q"
        placeholder="Cari deskripsi atau kategori"
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
      <input name="type" type="hidden" value={type} />
      <input name="category" type="hidden" value={category} />
      <input name="account" type="hidden" value={account} />
      <input name="sort" type="hidden" value={sort} />
      <input name="direction" type="hidden" value={direction} />
      {!open ? (
        <>
          <input name="month" type="hidden" value={filters.month ?? ""} />
          <input name="from" type="hidden" value={filters.from ?? ""} />
          <input name="to" type="hidden" value={filters.to ?? ""} />
        </>
      ) : null}
      <input name="pageSize" type="hidden" value={filters.pageSize} />

      {open ? (
        <div className="tx-sheet-backdrop" onClick={() => setOpen(false)}>
          <div
            aria-labelledby="tx-filter-title"
            aria-modal="true"
            className="tx-filter-sheet"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            role="dialog"
          >
            <div className="tx-sheet-header">
              <h2 id="tx-filter-title">Filter transaksi</h2>
              <button
                aria-label="Tutup filter"
                className="icon-button"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="tx-sheet-fields">
              <label className="field">
                <span>Jenis transaksi</span>
                <Select
                  aria-label="Jenis transaksi"
                  onChange={(event) => setType(event.target.value)}
                  value={type}
                >
                  <option value="">Semua jenis</option>
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </Select>
              </label>
              <label className="field">
                <span>Kategori</span>
                <Select
                  aria-label="Kategori"
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                >
                  <option value="">Semua kategori</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="field">
                <span>Akun</span>
                <Select
                  aria-label="Akun"
                  onChange={(event) => setAccount(event.target.value)}
                  value={account}
                >
                  <option value="">Semua akun</option>
                  {accounts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="field">
                <span>Periode</span>
                <DateRangeField month={filters.month} from={filters.from} to={filters.to} />
              </div>
              <label className="field">
                <span>Urutkan</span>
                <select
                  aria-label="Urutkan"
                  className="input"
                  onChange={(event) => setSort(event.target.value as TransactionFilters["sort"])}
                  value={sort}
                >
                  <option value="transactionAt">Tanggal</option>
                  <option value="amount">Jumlah</option>
                </select>
              </label>
              <label className="field">
                <span>Arah urutan</span>
                <select
                  aria-label="Arah urutan"
                  className="input"
                  onChange={(event) => setDirection(event.target.value as TransactionFilters["direction"])}
                  value={direction}
                >
                  <option value="desc">Terbaru dahulu</option>
                  <option value="asc">Terlama dahulu</option>
                </select>
              </label>
            </div>
            <div className="tx-sheet-actions">
              <Link className={buttonClass("secondary")} href="/transactions">
                Reset
              </Link>
              <button className={buttonClass("primary")} type="submit">
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
