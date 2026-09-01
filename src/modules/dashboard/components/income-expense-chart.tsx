"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";
import type { IncomeExpensePoint } from "../types/dashboard";

type TooltipEntry = { payload?: IncomeExpensePoint };

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
      <span>Income {formatIdr(point.incomeIdr)}</span>
      <span>Expense {formatIdr(point.expenseIdr)}</span>
    </div>
  );
}

export function IncomeExpenseChart({
  points,
}: {
  points: IncomeExpensePoint[];
}) {
  return (
    <div aria-hidden="true" className="mt-4 h-[18rem] w-full max-[540px]:h-[15rem]">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={points} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} stroke="var(--muted)" tickLine={false} />
          <YAxis domain={[0, 1]} hide />
          <Tooltip content={<ExactTooltip />} cursor={{ fill: "var(--surface-subtle)" }} />
          <Legend
            formatter={(value) =>
              value === "incomePlot" ? "Income" : "Expense"
            }
          />
          <Bar
            dataKey="incomePlot"
            fill="var(--income)"
            animationDuration={600}
            animationEasing="ease-out"
            maxBarSize={34}
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="expensePlot"
            fill="var(--expense)"
            animationDuration={600}
            animationEasing="ease-out"
            maxBarSize={34}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
