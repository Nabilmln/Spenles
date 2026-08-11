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
      <div className="mb-[.9rem] flex items-start justify-between gap-4">
        <div>
          <p className={eyebrowClass}>Kategori</p>
          <h2 className="m-0 text-[1.08rem] tracking-[-.02em]">
            Top Pengeluaran
          </h2>
          <p className="m-0 mt-[.25rem] text-[.78rem] text-muted">{periodLabel}</p>
        </div>
        <Link className={textLinkClass} href="/reports">
          Lihat laporan
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="rounded-[.8rem] border border-dashed border-border bg-surface-subtle p-[1.1rem] text-center text-[.82rem] text-muted">
          Belum ada pengeluaran pada periode ini.
        </div>
      ) : (
        <ol className="m-0 list-none p-0">
          {top.map((row, index) => {
            const Icon = resolveCategoryIcon(
              row.categoryId,
              row.name,
              row.icon,
            );
            return (
              <li key={row.categoryId} className="border-t border-border first:border-t-0">
                <Link
                  className="flex items-center gap-3 rounded-[.65rem] p-[.6rem_.25rem] no-underline transition-[background] duration-150 hover:bg-surface-subtle"
                  href={`/reports/categories/${row.categoryId}`}
                >
                  <span className="w-[1.4rem] shrink-0 text-center text-[.72rem] font-semibold text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-[2.3rem] shrink-0 place-items-center rounded-full bg-surface-subtle text-primary-700 dark:text-[#93c5fd] [&_svg]:size-[1.1rem]">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-[.84rem] font-medium [overflow-wrap:anywhere]">
                    {row.name}
                  </span>
                  <span className="min-w-0 shrink-0 text-[.82rem] font-medium [overflow-wrap:anywhere]">
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