"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";

export type ReportCategorySlice = {
  name: string;
  amountIdr: string;
  shareBps: number;
  fill: string;
};

type TooltipEntry = { payload?: ReportCategorySlice };

function SliceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice) return null;
  return (
    <div className="grid gap-[.2rem] rounded-[.65rem] border border-border bg-surface p-[.65rem_.75rem] text-[.75rem] text-foreground shadow-card">
      <strong>{slice.name}</strong>
      <span>{formatIdr(slice.amountIdr)}</span>
      <span>{(slice.shareBps / 100).toLocaleString("en-US")}%</span>
    </div>
  );
}

export function ReportCategoryChart({
  slices,
}: {
  slices: ReportCategorySlice[];
}) {
  return (
    <div aria-hidden="true" className="mt-4 h-[16rem] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={slices}
            dataKey="amountIdr"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="var(--surface)"
            strokeWidth={2}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {slices.map((slice) => (
              <Cell key={slice.name} fill={slice.fill} />
            ))}
          </Pie>
          <Tooltip content={<SliceTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}