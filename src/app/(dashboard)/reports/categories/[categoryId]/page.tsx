import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDateTime } from "@/lib/dates/jakarta";
import { formatIdr } from "@/lib/money/format-idr";
import {
  getReportOptions,
  listCategoryTransactions,
} from "@/modules/reports";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/u;
const CATEGORY_DETAIL_LIMIT = 200;

function todayKey() {
  const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function currentMonthKey() {
  const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const { categoryId } = await params;
  const raw = await searchParams;
  const today = todayKey();
  const currentMonth = currentMonthKey();
  const from =
    typeof raw.from === "string" && DATE_KEY.test(raw.from) ? raw.from : `${currentMonth}-01`;
  const to = typeof raw.to === "string" && DATE_KEY.test(raw.to) ? raw.to : today;

  const [options, rows] = await Promise.all([
    getReportOptions(user.id),
    listCategoryTransactions(user.id, categoryId, from, to, CATEGORY_DETAIL_LIMIT),
  ]);
  const category = options.categories.find((item) => item.id === categoryId);
  if (!category) notFound();

  const total = rows.reduce((sum, row) => sum + BigInt(row.amountIdr), 0n);

  return (
    <div className="page-stack narrow-page">
      <div className="page-heading-row">
        <SectionHeading
          eyebrow="Laporan"
          title={category.name}
          description={`Rincian ${category.type === "income" ? "pemasukan" : "pengeluaran"} dari ${from} s.d. ${to} dalam Asia/Jakarta.`}
        />
        <Link className="button button-secondary" href={`/reports?from=${from}&to=${to}`}>
          Kembali ke laporan
        </Link>
      </div>

      <div className="summary-card card summary-net">
        <div className="summary-card-heading">
          <h2>Total {category.type === "income" ? "pemasukan" : "pengeluaran"}</h2>
        </div>
        <strong className="summary-value">{formatIdr(total)}</strong>
      </div>

      {rows.length ? (
        <div className="transaction-list">
          {rows.map((row) => (
            <article className="transaction-row card" key={row.id}>
              <span className={`transaction-icon ${row.type}`}>
                {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
              </span>
              <div className="transaction-copy">
                <strong>{row.accountName}</strong>
                <span>{formatJakartaDateTime(row.transactionAt)}</span>
                {row.note ? <small>{row.note}</small> : null}
              </div>
              <strong className={`transaction-amount ${row.type}`}>
                {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
              </strong>
              <div className="transaction-actions">
                <Link
                  aria-label={`Edit transaksi ${row.note ?? ""}`}
                  className="icon-button"
                  href={`/transactions/${row.id}/edit`}
                >
                  <Pencil size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div>
            <h2>Belum ada transaksi</h2>
            <p>Tidak ada transaksi pada kategori dan periode ini.</p>
          </div>
        </div>
      )}
    </div>
  );
}
