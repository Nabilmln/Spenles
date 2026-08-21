import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass, emptyStateClass, entityHeadingClass, iconButtonClass, narrowPageClass, pageDescriptionClass, pageHeadingCopyClass, pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
import { formatJakartaDateLong, JAKARTA_OFFSET_MS } from "@/lib/dates/jakarta";
import { formatRangeLong } from "@/lib/dates/format-id";
import { formatIdr } from "@/lib/money/format-idr";
import {
  getReportOptions,
  listCategoryTransactions,
} from "@/modules/reports";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/u;
const CATEGORY_DETAIL_LIMIT = 200;

function todayKey() {
  const shifted = new Date(Date.now() + JAKARTA_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

function currentMonthKey() {
  const shifted = new Date(Date.now() + JAKARTA_OFFSET_MS);
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
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <div className={pageHeadingRowClass}>
        <div className={pageHeadingCopyClass}>
          <h2 className={entityHeadingClass}>{category.name}</h2>
          <p className={pageDescriptionClass}>{`Rincian ${category.type === "income" ? "pemasukan" : "pengeluaran"} dari ${formatRangeLong(from, to)} dalam Asia/Jakarta.`}</p>
        </div>
        <Link className={buttonClass("secondary")} href={`/reports?from=${from}&to=${to}`}>
          Kembali ke laporan
        </Link>
      </div>

      <div className={`${cardClass} grid gap-[.2rem]`}>
        <div>
          <h2 className="m-0 text-[.86rem] text-muted">Total {category.type === "income" ? "pemasukan" : "pengeluaran"}</h2>
        </div>
        <strong className="wrap-anywhere text-[clamp(1.35rem,2.5vw,2rem)] tracking-[-.04em]">{formatIdr(total)}</strong>
      </div>

      {rows.length ? (
        <div className="grid gap-[.75rem]">
          {rows.map((row) => (
            <article className={`${cardClass} grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 max-[540px]:grid-cols-[auto_minmax(0,1fr)_auto]`} key={row.id}>
              <span className={`grid size-[2.7rem] place-items-center rounded-full ${row.type === "income" ? "text-income bg-[color-mix(in_srgb,var(--income)_10%,transparent)]" : "text-expense bg-[color-mix(in_srgb,var(--expense)_10%,transparent)]"}`}>
                {row.type === "income" ? <ArrowDownLeft /> : <ArrowUpRight />}
              </span>
              <div className="grid min-w-0">
                <strong>{row.accountName}</strong>
                <span className="truncate text-muted">{formatJakartaDateLong(row.transactionAt)}</span>
                {row.note ? <small className="truncate text-muted">{row.note}</small> : null}
              </div>
              <strong className={`text-[.9rem] max-[540px]:col-start-2 ${row.type === "income" ? "text-income" : "text-expense"}`}>
                {row.type === "income" ? "+" : "−"} {formatIdr(row.amountIdr)}
              </strong>
              <div className="flex items-center gap-2 max-[540px]:col-start-3 max-[540px]:row-span-2">
                <Link
                  aria-label={`Edit transaksi ${row.note ?? ""}`}
                  className={iconButtonClass}
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
