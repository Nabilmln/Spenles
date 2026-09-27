"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";
import type { IncomeExpensePoint } from "@/modules/dashboard";

type TooltipEntry = { payload?: IncomeExpensePoint };

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="grid gap-[.15rem] rounded-[.65rem] border border-border bg-surface p-[.55rem_.7rem] text-[.75rem] text-foreground shadow-card">
      <strong>{point.label}</strong>
      <span className="text-muted">{formatIdr(point.expenseIdr)}</span>
    </div>
  );
}

export function TransactionTrendChart({
  points,
}: {
  points: IncomeExpensePoint[];
}) {
  return (
    <div aria-hidden="true" className="h-[17rem] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="expense-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--analytics)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--analytics)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            dataKey="label"
            fontSize={11}
            stroke="var(--foreground)"
            tickLine={false}
            tickMargin={6}
            interval="preserveStartEnd"
          />
          <YAxis domain={[0, 1]} hide />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ stroke: "var(--analytics)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="linear"
            dataKey="expensePlot"
            stroke="none"
            fill="url(#expense-trend-fill)"
            fillOpacity={1}
            isAnimationActive={false}
            activeDot={false}
          />
          <Line
            type="linear"
            dataKey="expensePlot"
            stroke="var(--analytics)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ r: 3, fill: "#ffffff", stroke: "var(--analytics)", strokeWidth: 1.5 }}
            activeDot={{
              r: 5,
              fill: "#ffffff",
              stroke: "var(--analytics)",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
