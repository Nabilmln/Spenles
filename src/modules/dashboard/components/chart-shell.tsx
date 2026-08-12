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
      <figcaption className="grid gap-[.2rem] mb-[.5rem]">
        <h2 className="m-0 text-[.95rem] tracking-[-.02em]">{title}</h2>
        <p className="m-0 text-[.76rem] text-muted">{description}</p>
        <strong className="mt-[.2rem] text-[.8rem]">{summary}</strong>
      </figcaption>
      {chart}
      <details className="mt-[.65rem] border-t border-border">
        <summary className="cursor-pointer pt-[.6rem] text-[.76rem] font-medium text-primary-600">
          Lihat data tabel
        </summary>
        {table}
      </details>
    </figure>
  );
}
