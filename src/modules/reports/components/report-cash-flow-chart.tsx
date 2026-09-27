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
    <div className="grid gap-[.15rem] rounded-[.7rem] border border-border bg-surface p-[.65rem_.8rem] text-[.75rem] text-foreground shadow-[0_6px_18px_rgb(15_15_18/8%)]">
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
    <div aria-hidden="true" className="mt-4 h-[17rem] w-full max-[540px]:h-[15rem]">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis dataKey="label" fontSize={11} stroke="var(--foreground)" tickLine={false} tickMargin={6} interval="preserveStartEnd" />
          <YAxis domain={[0, 1]} hide />
          <Tooltip
            content={<CashFlowTooltip />}
            cursor={{ stroke: "var(--muted)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Line
            type="linear"
            dataKey="incomePlot"
            stroke="var(--income)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ r: 3, fill: "none", stroke: "var(--income)", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "none", stroke: "var(--income)", strokeWidth: 2 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
          <Line
            type="linear"
            dataKey="expensePlot"
            stroke="var(--analytics)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{ r: 3, fill: "#ffffff", stroke: "var(--analytics)", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "#ffffff", stroke: "var(--analytics)", strokeWidth: 2 }}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
