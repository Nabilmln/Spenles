import type { ReactNode } from "react";

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
    <figure className="dashboard-chart card">
      <figcaption>
        <h2>{title}</h2>
        <p>{description}</p>
        <strong>{summary}</strong>
      </figcaption>
      {chart}
      <details className="chart-details">
        <summary>Lihat data tabel</summary>
        {table}
      </details>
    </figure>
  );
}
