"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
        Income <span className="font-semibold">{formatIdr(point.incomeIdr)}</span>
      </span>
      <span>
        Expense <span className="font-semibold">{formatIdr(point.expenseIdr)}</span>
      </span>
    </div>
  );
}

export function ReportCashFlowChart({
  points,
}: {
  points: CashFlowPoint[];
}) {
  return (
    <div aria-hidden="true" className="mt-4 h-[15rem] w-full max-[540px]:h-[13rem]">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="reportExpenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-600)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--primary-600)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="reportIncomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--income)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis dataKey="label" fontSize={11} stroke="var(--foreground)" tickLine={false} tickMargin={6} interval="preserveStartEnd" />
          <YAxis domain={[0, 1]} hide />
          <Tooltip
            content={<CashFlowTooltip />}
            cursor={{ stroke: "var(--muted)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="linear"
            dataKey="incomePlot"
            stroke="var(--income)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#reportIncomeFill)"
            dot={{ r: 3, fill: "none", stroke: "var(--income)", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "none", stroke: "var(--income)", strokeWidth: 2 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
          <Area
            type="linear"
            dataKey="expensePlot"
            stroke="var(--primary-600)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#reportExpenseFill)"
            dot={{ r: 3, fill: "none", stroke: "var(--primary-600)", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "none", stroke: "var(--primary-600)", strokeWidth: 2 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}