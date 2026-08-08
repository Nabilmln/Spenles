import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, emptyStateClass } from "@/components/ui/styles";
import { formatJakartaDateLong } from "@/lib/dates/jakarta";
import { formatRangeLong } from "@/lib/dates/format-id";
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
        <div className="page-heading-copy">
          <h2 className="entity-heading">{category.name}</h2>
          <p className="page-description">{`Rincian ${category.type === "income" ? "pemasukan" : "pengeluaran"} dari ${formatRangeLong(from, to)} dalam Asia/Jakarta.`}</p>
        </div>
        <Link className={buttonClass("secondary")} href={`/reports?from=${from}&to=${to}`}>
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
                <span>{formatJakartaDateLong(row.transactionAt)}</span>
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
        <div className={emptyStateClass}>
          <div>
            <h2>Belum ada transaksi</h2>
            <p className="m-0 text-muted">Tidak ada transaksi pada kategori dan periode ini.</p>
          </div>
        </div>
      )}
    </div>
  );
}
