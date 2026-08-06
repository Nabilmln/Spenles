import Link from "next/link";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatIdr } from "@/lib/money/format-idr";
import {
  ChartShell,
  IncomeExpenseChart,
} from "@/modules/dashboard";
import {
  getReportAnalysis,
  getReportOptions,
  ReportPeriodField,
} from "@/modules/reports";
import type { ReportMonth } from "@/modules/reports/types";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/u;

function jakartaDateKey(offsetDays = 0) {
  const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000);
  shifted.setUTCDate(shifted.getUTCDate() + offsetDays);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function currentJakartaMonth() {
  const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function buildIncomeExpensePoints(months: ReportMonth[]) {
  const maximum = months.reduce((max, item) => {
    const income = BigInt(item.incomeIdr);
    const expense = BigInt(item.expenseIdr);
    return income > max ? income : expense > max ? expense : max;
  }, 0n);
  return months.map((item) => {
    const income = BigInt(item.incomeIdr);
    const expense = BigInt(item.expenseIdr);
    const plot = (value: bigint) =>
      maximum === 0n ? 0 : Number((value * 10_000n) / maximum) / 10_000;
    return {
      period: item.month,
      label: monthLabel(item.month),
      incomeIdr: item.incomeIdr,
      expenseIdr: item.expenseIdr,
      incomePlot: plot(income),
      expensePlot: plot(expense),
    };
  });
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const raw = await searchParams;
  const today = jakartaDateKey();
  const currentMonth = currentJakartaMonth();
  const defaultFrom = `${currentMonth}-01`;
  const from =
    typeof raw.from === "string" && DATE_KEY.test(raw.from) ? raw.from : defaultFrom;
  const to = typeof raw.to === "string" && DATE_KEY.test(raw.to) ? raw.to : today;

  const [options, analysis] = await Promise.all([
    getReportOptions(user.id),
    getReportAnalysis(user.id, from, to),
  ]);
  const year = currentMonth.slice(0, 4);
  const points = buildIncomeExpensePoints(analysis.months);
  const totalIncome = BigInt(analysis.summary.incomeIdr);
  const totalExpense = BigInt(analysis.summary.expenseIdr);
  const net = totalIncome - totalExpense;

  return (
    <div className="page-stack reports-page">
      <SectionHeading
        eyebrow="Laporan"
        title="Analisis keuangan"
        description="Pantau pemasukan dan pengeluaran per periode, lalu ekspor laporan bila diperlukan. Semua data privat dari sesi Anda."
      />

      <form className="report-analysis-form" id="report-analysis-form" method="get">
        <div className="field">
          <label htmlFor="report-analysis-range">Periode</label>
          <ReportPeriodField from={from} to={to} />
        </div>
      </form>

      <section aria-label="Ikhtisar periode" className="summary-grid">
        <div className="summary-card card summary-income">
          <div className="summary-card-heading">
            <h2>Pendapatan</h2>
          </div>
          <strong className="summary-value">+ {formatIdr(totalIncome)}</strong>
        </div>
        <div className="summary-card card summary-expense">
          <div className="summary-card-heading">
            <h2>Pengeluaran</h2>
          </div>
          <strong className="summary-value">− {formatIdr(totalExpense)}</strong>
        </div>
        <div className="summary-card card summary-net">
          <div className="summary-card-heading">
            <h2>Selisih</h2>
          </div>
          <strong className="summary-value">{formatIdr(net)}</strong>
        </div>
      </section>

      <section aria-labelledby="report-cash-flow-title">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Arus kas</p>
            <h2 id="report-cash-flow-title">Pemasukan vs pengeluaran</h2>
          </div>
          <p>{from} s.d. {to}</p>
        </div>
        <ChartShell
          chart={
            <IncomeExpenseChart points={points} />
          }
          description="Pemasukan dan pengeluaran per bulan kalender Jakarta."
          summary={`Pemasukan ${formatIdr(totalIncome)} · Pengeluaran ${formatIdr(totalExpense)}`}
          table={null}
          title="Perbandingan bulanan"
        />
      </section>

      <section aria-labelledby="report-categories-title" className="card report-category-card">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Pengeluaran</p>
            <h2 id="report-categories-title">Pengeluaran per kategori</h2>
          </div>
        </div>
        {analysis.categories.length ? (
          <div className="report-category-list">
            {analysis.categories.map((category) => {
              const amount = BigInt(category.amountIdr);
              const share = totalExpense === 0n
                ? 0
                : Number((amount * 10_000n) / totalExpense) / 100;
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
            Belum ada pengeluaran pada periode ini.
          </div>
        )}
      </section>

      <details className="report-exports" aria-labelledby="report-exports-title">
        <summary id="report-exports-title">
          <FileText aria-hidden="true" size={20} />
          <span>Ekspor laporan dan data</span>
          <Download aria-hidden="true" size={18} />
        </summary>

        <section className="report-grid" aria-label="Laporan PDF">
          <article className="card report-card">
            <FileText aria-hidden="true" />
            <div>
              <h2>Laporan PDF bulanan</h2>
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
                  defaultValue={currentMonth}
                  min="2000-01"
                  max={currentMonth}
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
                    defaultValue={`${currentMonth}-01`}
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
                  defaultValue={currentMonth}
                  min="2000-01"
                  max={currentMonth}
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
      </details>
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
