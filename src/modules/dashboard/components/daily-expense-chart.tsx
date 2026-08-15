"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";
import type { DailyExpensePoint } from "../types/dashboard";

type TooltipEntry = { payload?: DailyExpensePoint };

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
      <strong>{point.label}</strong>
      <span>{formatIdr(point.expenseIdr)}</span>
    </div>
  );
}

export function DailyExpenseChart({
  points,
}: {
  points: DailyExpensePoint[];
}) {
  return (
    <div aria-hidden="true" className="mt-4 h-[15rem] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={points} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} stroke="var(--muted)" tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 1]} hide />
          <Tooltip content={<ExactTooltip />} cursor={{ stroke: "var(--muted)" }} />
          <Line
            dataKey="plot"
            dot={false}
            animationDuration={600}
            animationEasing="ease-out"
            stroke="var(--primary-600)"
            strokeWidth={2.5}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
