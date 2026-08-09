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
    <div className="mt-[.75rem] max-w-full overflow-x-auto">
      <table className="w-full border-collapse text-[.78rem]">
        <caption className="pb-[.55rem] text-left text-muted">
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={`whitespace-nowrap border-b border-border p-[.55rem] text-left text-[.7rem] uppercase text-muted ${column.align === "right" ? "text-right" : ""}`}
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
                  className={`whitespace-nowrap border-b border-border p-[.55rem] text-left ${column.align === "right" ? "text-right" : ""}`}
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
