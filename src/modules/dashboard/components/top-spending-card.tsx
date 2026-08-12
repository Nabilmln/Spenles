import Link from "next/link";
import {
  cardClass,
  eyebrowClass,
  textLinkClass,
} from "@/components/ui/styles";
import { resolveCategoryIcon } from "@/modules/categories/constants/category-icons";
import { formatIdr } from "@/lib/money/format-idr";
import type { CategoryAggregate } from "../types/dashboard";

const TOP_COUNT = 5;

export function TopSpendingCard({
  periodLabel,
  rows,
}: {
  periodLabel: string;
  rows: CategoryAggregate[];
}) {
  const top = rows.slice(0, TOP_COUNT);

  return (
    <section
      aria-label="Kategori pengeluaran terbesar"
      className={`${cardClass} flex h-full flex-col shadow-none`}
    >
      <div className="mb-[.65rem] flex items-start justify-between gap-3">
        <div>
          <p className={eyebrowClass}>Kategori</p>
          <h2 className="m-0 text-[.95rem] tracking-[-.02em]">
            Top Pengeluaran
          </h2>
          <p className="m-0 mt-[.15rem] text-[.72rem] text-muted">{periodLabel}</p>
        </div>
        <Link className={`${textLinkClass} text-[.78rem]`} href="/reports">
          Lihat laporan
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="rounded-[.65rem] border border-dashed border-border bg-surface-subtle p-[.85rem] text-center text-[.76rem] text-muted">
          Belum ada pengeluaran pada periode ini.
        </div>
      ) : (
        <ol className="m-0 flex-1 list-none p-0">
          {top.map((row, index) => {
            const Icon = resolveCategoryIcon(
              row.categoryId,
              row.name,
              row.icon,
            );
            return (
              <li key={row.categoryId} className="border-t border-border first:border-t-0">
                <Link
                  className="flex items-center gap-[.6rem] rounded-[.55rem] p-[.45rem_.2rem] no-underline transition-[background] duration-150 hover:bg-surface-subtle"
                  href={`/reports/categories/${row.categoryId}`}
                >
                  <span className="w-[1.2rem] shrink-0 text-center text-[.68rem] font-semibold text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-[2rem] shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600 dark:text-primary-700 [&_svg]:size-[.95rem]">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-[.8rem] font-medium [overflow-wrap:anywhere]">
                    {row.name}
                  </span>
                  <span className="min-w-0 shrink-0 text-[.78rem] font-medium [overflow-wrap:anywhere]">
                    {formatIdr(row.expense)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}