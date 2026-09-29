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
import type { CashFlowPoint } from "./report-cash-flow";

type TooltipEntry = { payload?: CashFlowPoint };

function CashFlowTooltip({
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
      <span>
        Income <span className="font-medium text-income">{formatIdr(point.incomeIdr)}</span>
      </span>
      <span>
        Expense <span className="font-medium text-amount">{formatIdr(point.expenseIdr)}</span>
      </span>
    </div>
  );
}

export function ReportCashFlowChart({
  points,
}: {
  points: CashFlowPoint[];
}) {
  const singlePoint = points.length === 1;
  return (
    <div aria-label="Income (green) and expense (blue) trends" role="group" className="mt-4 min-w-0">
      <div className="chart-vertical-guides h-[17rem] w-full">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={points} margin={{ top: 12, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="report-expense-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--analytics)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--analytics)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" hide axisLine={false} tickLine={false} />
            <YAxis domain={[0, 1]} hide />
            <Tooltip
              content={<CashFlowTooltip />}
              cursor={{ stroke: "var(--analytics)", strokeWidth: 1, strokeOpacity: 0.45 }}
            />
            <Area
              type="basis"
              dataKey="expensePlot"
              stroke="none"
              fill="url(#report-expense-fill)"
              fillOpacity={1}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="basis"
              dataKey="incomePlot"
              stroke="var(--income)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={singlePoint ? { r: 4, fill: "#ffffff", stroke: "var(--income)", strokeWidth: 2 } : false}
              activeDot={{ r: 4, fill: "#ffffff", stroke: "var(--income)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="basis"
              dataKey="expensePlot"
              stroke="var(--analytics)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={singlePoint ? { r: 4, fill: "#ffffff", stroke: "var(--analytics)", strokeWidth: 2 } : false}
              activeDot={{ r: 4, fill: "#ffffff", stroke: "var(--analytics)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {points.length > 0 ? (
        <div className="flex justify-between gap-3 text-[.72rem] text-muted">
          <time dateTime={points[0].period} className="min-w-0 max-w-[48%] truncate">{points[0].label}</time>
          {points.length > 1 ? <time dateTime={points.at(-1)?.period} className="min-w-0 max-w-[48%] truncate text-right">{points.at(-1)?.label}</time> : null}
        </div>
      ) : null}
    </div>
  );
}
