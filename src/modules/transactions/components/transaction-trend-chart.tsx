"use client";

import {
  Area,
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

function formatAxisDate(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

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
      <span className="font-medium text-amount">{formatIdr(point.expenseIdr)}</span>
    </div>
  );
}

export function TransactionTrendChart({
  points,
  hasData,
}: {
  points: IncomeExpensePoint[];
  hasData: boolean;
}) {
  const firstDay = points[0]?.period;
  const lastDay = points.at(-1)?.period;

  return (
    <div aria-label={hasData ? "Cumulative expenses this month" : "Cumulative expenses this month: zero so far"} role="group" className="mt-4 min-w-0">
      <div className="chart-vertical-guides h-[17rem] w-full">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            data={points}
            margin={{ top: 12, right: 5, left: 5, bottom: 0 }}
          >
            <defs>
              <linearGradient id="expense-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--analytics)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--analytics)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" hide axisLine={false} tickLine={false} />
            <YAxis domain={[-0.05, 1]} hide />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: "var(--analytics)", strokeWidth: 1, strokeOpacity: 0.45 }}
            />
            <Area
              type="basis"
              dataKey="expensePlot"
              stroke="none"
              fill="url(#expense-trend-fill)"
              fillOpacity={1}
              isAnimationActive={false}
              activeDot={false}
            />
            <Line
              type="basis"
              dataKey="expensePlot"
              stroke="var(--analytics)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 4, fill: "#ffffff", stroke: "var(--analytics)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {firstDay && lastDay ? (
        <div className="flex justify-between gap-3 text-[.72rem] text-muted">
          <time dateTime={firstDay}>{formatAxisDate(firstDay)}</time>
          <time dateTime={lastDay}>{formatAxisDate(lastDay)}</time>
        </div>
      ) : null}
    </div>
  );
}
