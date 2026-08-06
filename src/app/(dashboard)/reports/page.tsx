import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { REPORT_TIMEZONE } from "@/modules/reports/constants";
import { getReportOptions } from "@/modules/reports";

function currentJakartaMonth() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

export default async function ReportsPage() {
  const user = await requireSessionUser();
  const options = await getReportOptions(user.id);
  const month = currentJakartaMonth();
  const year = month.slice(0, 4);

  return (
    <div className="page-stack reports-page">
      <SectionHeading
        eyebrow="Phase 06"
        title="Laporan dan ekspor"
        description="Unduh laporan PDF, transaksi CSV, atau backup data pribadi. Semua hasil dibuat privat dari sesi Anda."
      />

      <section className="report-grid" aria-labelledby="pdf-report-title">
        <article className="card report-card">
          <FileText aria-hidden="true" />
          <div>
            <h2 id="pdf-report-title">Laporan PDF bulanan</h2>
            <p>Ringkasan keuangan, akun, kategori, anggaran, dan detail opsional.</p>
          </div>
          <form action="/api/reports/pdf" method="get" className="report-form">
            <input type="hidden" name="period" value="month" />
            <div className="field">
              <label htmlFor="report-month">Bulan</label>
              <input
                className="input"
                id="report-month"
                name="month"
                type="month"
                defaultValue={month}
                min="2000-01"
                max={month}
                required
              />
            </div>
            <ReportFilters options={options} prefix="monthly" />
            <label className="report-checkbox">
              <input name="details" type="checkbox" value="true" />
              Sertakan detail transaksi (maks. 500)
            </label>
            <button className="button button-primary" type="submit">
              <Download size={18} aria-hidden="true" />
              Unduh PDF
            </button>
          </form>
        </article>

        <article className="card report-card">
          <FileText aria-hidden="true" />
          <div>
            <h2>Laporan PDF tahunan</h2>
            <p>Ikhtisar satu tahun kalender dengan batas Asia/Jakarta.</p>
          </div>
          <form action="/api/reports/pdf" method="get" className="report-form">
            <input type="hidden" name="period" value="year" />
            <div className="field">
              <label htmlFor="report-year">Tahun</label>
              <input
                className="input"
                id="report-year"
                name="year"
                type="number"
                defaultValue={year}
                min="2000"
                max={year}
                required
              />
            </div>
            <ReportFilters options={options} prefix="yearly" />
            <label className="report-checkbox">
              <input name="details" type="checkbox" value="true" />
              Sertakan detail transaksi (maks. 500)
            </label>
            <button className="button button-primary" type="submit">
              <Download size={18} aria-hidden="true" />
              Unduh PDF
            </button>
          </form>
        </article>

        <article className="card report-card">
          <FileText aria-hidden="true" />
          <div>
            <h2>Laporan PDF rentang khusus</h2>
            <p>Pilih rentang inklusif hingga 366 hari dan tidak melampaui hari ini.</p>
          </div>
          <form action="/api/reports/pdf" method="get" className="report-form">
            <input type="hidden" name="period" value="custom" />
            <div className="report-date-grid">
              <div className="field">
                <label htmlFor="report-from">Dari</label>
                <input
                  className="input"
                  id="report-from"
                  name="from"
                  type="date"
                  defaultValue={`${year}-01-01`}
                  min="2000-01-01"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="report-to">Sampai</label>
                <input
                  className="input"
                  id="report-to"
                  name="to"
                  type="date"
                  defaultValue={`${month}-01`}
                  min="2000-01-01"
                  required
                />
              </div>
            </div>
            <ReportFilters options={options} prefix="custom" />
            <label className="report-checkbox">
              <input name="details" type="checkbox" value="true" />
              Sertakan detail transaksi (maks. 500)
            </label>
            <button className="button button-primary" type="submit">
              <Download size={18} aria-hidden="true" />
              Unduh PDF
            </button>
          </form>
        </article>
      </section>

      <section className="report-grid" aria-label="Ekspor data">
        <article className="card report-card compact-report-card">
          <FileSpreadsheet aria-hidden="true" />
          <div>
            <h2>Transaksi CSV</h2>
            <p>
              CSV UTF-8 berisi transaksi aktif bulan pilihan. Teks berbahaya
              dinetralkan untuk spreadsheet.
            </p>
          </div>
          <form action="/api/exports/transactions.csv" method="get" className="report-form">
            <input type="hidden" name="period" value="month" />
            <div className="field">
              <label htmlFor="csv-month">Bulan</label>
              <input
                className="input"
                id="csv-month"
                name="month"
                type="month"
                defaultValue={month}
                min="2000-01"
                max={month}
                required
              />
            </div>
            <button className="button button-secondary" type="submit">
              <Download size={18} aria-hidden="true" />
              Unduh CSV
            </button>
          </form>
        </article>

        <article className="card report-card compact-report-card">
          <FileJson aria-hidden="true" />
          <div>
            <h2>Backup data pribadi</h2>
            <p>
              JSON versi 1.0 berisi data finansial milik Anda, termasuk riwayat
              terhapus, tanpa sesi, token, kata sandi, atau rahasia.
            </p>
          </div>
          <a className="button button-secondary" href="/api/exports/backup">
            <Download size={18} aria-hidden="true" />
            Unduh backup
          </a>
        </article>
      </section>

      <p className="financial-disclaimer">
        Batas: periode 366 hari, CSV 10.000 transaksi, detail PDF 500 transaksi,
        dan ukuran file 3,5 MB. Ekspor tidak disimpan oleh Spenles.
      </p>
    </div>
  );
}

function ReportFilters({
  options,
  prefix,
}: {
  options: Awaited<ReturnType<typeof getReportOptions>>;
  prefix: string;
}) {
  return (
    <div className="report-filter-grid">
      <div className="field">
        <label htmlFor={`${prefix}-type`}>Jenis transaksi</label>
        <select className="input" id={`${prefix}-type`} name="type" defaultValue="">
          <option value="">Semua</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${prefix}-account`}>Akun</label>
        <select className="input" id={`${prefix}-account`} name="account" defaultValue="">
          <option value="">Semua akun</option>
          {options.accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
              {account.status === "archived" ? " (diarsipkan)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${prefix}-category`}>Kategori</label>
        <select className="input" id={`${prefix}-category`} name="category" defaultValue="">
          <option value="">Semua kategori</option>
          {options.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} · {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
              {category.status === "archived" ? " (diarsipkan)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
