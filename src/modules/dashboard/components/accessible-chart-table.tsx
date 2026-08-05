import type { ReactNode } from "react";

export type ChartTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export function AccessibleChartTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: ChartTableColumn[];
  rows: Array<Record<string, ReactNode>>;
}) {
  return (
    <div className="chart-table-wrap">
      <table className="chart-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={column.align === "right" ? "numeric" : undefined}
                key={column.key}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td
                  className={column.align === "right" ? "numeric" : undefined}
                  key={column.key}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
