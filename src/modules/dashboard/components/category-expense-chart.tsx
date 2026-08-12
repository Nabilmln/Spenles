"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";
import type { CategoryExpensePoint } from "../types/dashboard";

type TooltipEntry = { payload?: CategoryExpensePoint };

function ExactTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="grid gap-[.2rem] rounded-[.65rem] border border-border bg-surface p-[.65rem_.75rem] text-[.75rem] text-foreground shadow-card">
      <strong>{point.name}</strong>
      <span>{formatIdr(point.expenseIdr)}</span>
      <span>{(point.shareBps / 100).toLocaleString("id-ID")}%</span>
    </div>
  );
}

export function CategoryExpenseChart({
  points,
}: {
  points: CategoryExpensePoint[];
}) {
  return (
    <div aria-hidden="true" className="mt-2 h-[11rem] w-full max-[540px]:h-[10rem]">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={points}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis domain={[0, 10_000]} hide type="number" />
          <YAxis
            dataKey="name"
            fontSize={12}
            stroke="var(--muted)"
            tickLine={false}
            type="category"
            width={105}
          />
          <Tooltip content={<ExactTooltip />} cursor={{ fill: "var(--surface-subtle)" }} />
          <Bar dataKey="shareBps" isAnimationActive={false} radius={[0, 7, 7, 0]}>
            {points.map((point) => (
              <Cell fill={point.color} key={point.categoryId} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
