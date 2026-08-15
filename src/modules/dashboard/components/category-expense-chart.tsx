"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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
  totalExpense,
}: {
  points: CategoryExpensePoint[];
  totalExpense: string;
}) {
  return (
    <div aria-hidden="true" className="relative mt-4 h-[19rem] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={points}
            dataKey="shareBps"
            innerRadius="55%"
            isAnimationActive={false}
            nameKey="name"
            outerRadius="85%"
            paddingAngle={2}
            stroke="var(--surface)"
            strokeWidth={2}
          >
            {points.map((point) => (
              <Cell key={point.categoryId} fill={point.color} />
            ))}
          </Pie>
          <Tooltip content={<ExactTooltip />} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}