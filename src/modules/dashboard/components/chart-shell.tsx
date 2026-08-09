import type { ReactNode } from "react";
import { cardClass } from "@/components/ui/styles";

export function ChartShell({
  title,
  description,
  summary,
  chart,
  table,
}: {
  title: string;
  description: string;
  summary: string;
  chart: ReactNode;
  table: ReactNode;
}) {
  return (
    <figure className={`${cardClass} m-0 min-w-0 shadow-none`}>
      <figcaption className="grid gap-[.3rem]">
        <h2 className="m-0 text-[1.08rem] tracking-[-.02em]">{title}</h2>
        <p className="m-0 text-[.84rem] text-muted">{description}</p>
        <strong className="mt-[.25rem] text-[.88rem]">{summary}</strong>
      </figcaption>
      {chart}
      <details className="mt-[.85rem] border-t border-border">
        <summary className="cursor-pointer pt-[.8rem] text-[.82rem] font-medium text-primary-600">
          Lihat data tabel
        </summary>
        {table}
      </details>
    </figure>
  );
}
