import type { ReactNode } from "react";

export function ChartShell({
  title,
  summary,
  chart,
}: {
  title: string;
  summary: string;
  chart: ReactNode;
}) {
  return (
    <figure className="m-0 min-w-0">
      <figcaption className="grid gap-[.2rem] mb-[.5rem]">
        <h2 className="m-0 text-[.95rem] tracking-[-.02em]">{title}</h2>
        <strong className="mt-[.2rem] text-[.8rem]">{summary}</strong>
      </figcaption>
      {chart}
    </figure>
  );
}
