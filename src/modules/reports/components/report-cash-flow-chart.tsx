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

function formatAxisDate(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

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
        Income <span className="font-medium text-foreground">{formatIdr(point.incomeIdr)}</span>
      </span>
      <span>
        Expense <span className="font-medium text-amount">{formatIdr(point.expenseIdr)}</span>
      </span>
    </div>
  );
}

export function ReportCashFlowChart({
  points,
  from,
  to,
}: {
  points: CashFlowPoint[];
  from: string;
  to: string;
}) {
  const singlePoint = points.length === 1;
  const allZero = points.every((point) => point.incomePlot === 0 && point.expensePlot === 0);
  return (
    <div aria-label={allZero ? "Income and expense trends: zero throughout this period" : "Income (black) and expense (blue) trends"} role="group" className="mt-4 min-w-0">
      <div className="chart-vertical-guides h-[17rem] w-full">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={points} margin={{ top: 12, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="report-income-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="report-expense-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--analytics)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--analytics)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" hide axisLine={false} tickLine={false} />
            <YAxis domain={[-0.05, 1]} hide />
            <Tooltip
              content={<CashFlowTooltip />}
              cursor={{ stroke: "var(--analytics)", strokeWidth: 1, strokeOpacity: 0.45 }}
            />
            <Area
              type="basis"
              dataKey="incomePlot"
              stroke="none"
              fill="url(#report-income-fill)"
              fillOpacity={1}
              activeDot={false}
              isAnimationActive={false}
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
              stroke="var(--foreground)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={singlePoint ? { r: 4, fill: "#ffffff", stroke: "var(--foreground)", strokeWidth: 2 } : false}
              activeDot={{ r: 4, fill: "#ffffff", stroke: "var(--foreground)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="basis"
              dataKey="expensePlot"
              stroke="var(--analytics)"
              strokeDasharray={allZero ? "4 5" : undefined}
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
      <div className={`flex gap-3 text-[.72rem] text-muted ${from === to ? "justify-center" : "justify-between"}`}>
        <time dateTime={from} className="min-w-0 max-w-[48%] truncate">{formatAxisDate(from)}</time>
        {from !== to ? <time dateTime={to} className="min-w-0 max-w-[48%] truncate text-right">{formatAxisDate(to)}</time> : null}
      </div>
    </div>
  );
}
