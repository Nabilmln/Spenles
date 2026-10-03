"use client";

import { useId, useSyncExternalStore } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatIdr } from "@/lib/money/format-idr";

export type ReportCategorySlice = {
  name: string;
  amountIdr: string;
  shareBps: number;
  fill: string;
};

type TooltipEntry = { payload?: ReportCategorySlice };

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  if (!window.matchMedia) return () => {};
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function shouldAnimatePie() {
  return !(window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false);
}

function SliceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice) return null;
  return (
    <div className="grid gap-[.2rem] rounded-[.65rem] border border-border bg-surface p-[.65rem_.75rem] text-[.75rem] text-foreground shadow-card">
      <strong>{slice.name}</strong>
      <span>{formatIdr(slice.amountIdr)}</span>
      <span>{(slice.shareBps / 100).toLocaleString("en-US")}%</span>
    </div>
  );
}

export function ReportCategoryChart({
  slices,
}: {
  slices: ReportCategorySlice[];
}) {
  const patternPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const animateOnEntry = useSyncExternalStore(
    subscribeToMotionPreference,
    shouldAnimatePie,
    () => null,
  );
  const chartDataKey = JSON.stringify(slices.map(({ name, amountIdr, shareBps }) => [name, amountIdr, shareBps]));

  return (
    <div aria-hidden="true" className="mt-4 h-[16rem] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <defs>
            {slices.map((slice, index) => (
              <pattern
                id={`${patternPrefix}-category-${index}`}
                key={`${slice.name}-${index}`}
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
              >
                <rect width="8" height="8" fill="var(--surface)" />
                <rect width="8" height="8" fill={slice.fill} fillOpacity="0.1" />
                <path d="M 0 0 V 8" stroke={slice.fill} strokeWidth="3" />
              </pattern>
            ))}
          </defs>
          {animateOnEntry !== null ? (
            <Pie
              key={chartDataKey}
              data={slices}
              dataKey="shareBps"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
              isAnimationActive={animateOnEntry}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {slices.map((slice, index) => (
                <Cell
                  key={`${slice.name}-${index}`}
                  fill={`url(#${patternPrefix}-category-${index})`}
                  stroke={slice.fill}
                  strokeWidth={1.5}
                />
              ))}
            </Pie>
          ) : null}
          <Tooltip content={<SliceTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
