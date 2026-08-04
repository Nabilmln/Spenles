import type { TransactionFilters } from "../schemas/transaction-filters";

export function TransactionFiltersForm({
  filters,
  accounts,
  categories,
}: {
  filters: TransactionFilters;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: "income" | "expense" }[];
}) {
  return (
    <form method="get" className="filter-panel">
      <input className="input" name="q" defaultValue={filters.q} placeholder="Cari catatan..." aria-label="Cari catatan" />
      <select className="input" name="type" defaultValue={filters.type ?? ""} aria-label="Jenis transaksi">
        <option value="">Semua jenis</option><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option>
      </select>
      <select className="input" name="category" defaultValue={filters.category ?? ""} aria-label="Kategori">
        <option value="">Semua kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select className="input" name="account" defaultValue={filters.account ?? ""} aria-label="Akun">
        <option value="">Semua akun</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <input className="input" type="month" name="month" defaultValue={filters.month} aria-label="Bulan" />
      <input className="input" type="date" name="from" defaultValue={filters.from} aria-label="Tanggal awal" />
      <input className="input" type="date" name="to" defaultValue={filters.to} aria-label="Tanggal akhir" />
      <select className="input" name="sort" defaultValue={filters.sort} aria-label="Urutkan">
        <option value="transactionAt">Tanggal</option><option value="amount">Jumlah</option>
      </select>
      <select className="input" name="direction" defaultValue={filters.direction} aria-label="Arah urutan">
        <option value="desc">Menurun</option><option value="asc">Menaik</option>
      </select>
      <select className="input" name="pageSize" defaultValue={filters.pageSize} aria-label="Jumlah per halaman">
        <option value="10">10</option><option value="20">20</option><option value="50">50</option>
      </select>
      <button className="button button-primary" type="submit">Terapkan</button>
      <a className="button button-secondary" href="/transactions">Reset</a>
    </form>
  );
}
