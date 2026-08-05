"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";
import type { MonthlyExpensePoint } from "../types/dashboard";

type TooltipEntry = { payload?: MonthlyExpensePoint };

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
    <div className="chart-tooltip">
      <strong>{point.label}</strong>
      <span>{formatIdr(point.expenseIdr)}</span>
    </div>
  );
}

export function MonthlyExpenseChart({
  points,
}: {
  points: MonthlyExpensePoint[];
}) {
  return (
    <div aria-hidden="true" className="chart-canvas">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={points} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} stroke="var(--muted)" tickLine={false} />
          <YAxis domain={[0, 1]} hide />
          <Tooltip content={<ExactTooltip />} cursor={{ fill: "var(--surface-subtle)" }} />
          <Bar
            dataKey="plot"
            fill="var(--expense)"
            isAnimationActive={false}
            maxBarSize={52}
            radius={[7, 7, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
