import type {
  CategoryAggregate,
  CategoryExpensePoint,
  DailyExpenseAggregate,
  DateInterval,
  DailyExpensePoint,
  IncomeExpensePoint,
  MonthlyAggregate,
  MonthlyExpensePoint,
} from "../types/dashboard";
import { fourDayJakartaInterval } from "./periods";

const CATEGORY_COLORS: Record<string, string> = {
  blue: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#d97706",
  purple: "#7c3aed",
  pink: "#db2777",
  cyan: "#0891b2",
  slate: "#64748b",
};

function monthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function normalizedPlot(value: bigint, maximum: bigint) {
  if (maximum === 0n) return 0;
  return Number((value * 10_000n) / maximum) / 10_000;
}

function zeroFilledMonths(
  monthKeys: string[],
  rows: MonthlyAggregate[],
): MonthlyAggregate[] {
  const byPeriod = new Map(rows.map((row) => [row.period, row]));
  return monthKeys.map(
    (period) => byPeriod.get(period) ?? { period, income: 0n, expense: 0n },
  );
}

export function buildMonthlyChartContract(
  monthKeys: string[],
  rows: MonthlyAggregate[],
) {
  const filled = zeroFilledMonths(monthKeys, rows);
  const maximum = filled.reduce(
    (value, item) =>
      item.income > value
        ? item.income
        : item.expense > value
          ? item.expense
          : value,
    0n,
  );
  const totalIncome = filled.reduce((sum, item) => sum + item.income, 0n);
  const totalExpense = filled.reduce((sum, item) => sum + item.expense, 0n);

  const expensePoints: MonthlyExpensePoint[] = filled.map((item) => ({
    period: item.period,
    label: monthLabel(item.period),
    expenseIdr: item.expense.toString(),
    plot: normalizedPlot(item.expense, maximum),
  }));

  const incomeExpensePoints: IncomeExpensePoint[] = filled.map((item) => ({
    period: item.period,
    label: monthLabel(item.period),
    incomeIdr: item.income.toString(),
    expenseIdr: item.expense.toString(),
    incomePlot: normalizedPlot(item.income, maximum),
    expensePlot: normalizedPlot(item.expense, maximum),
  }));

  return {
    filled,
    expensePoints,
    incomeExpensePoints,
    totalIncome,
    totalExpense,
  };
}

function roundedShares(values: bigint[], total: bigint) {
  if (total === 0n) return values.map(() => 0);
  const floors = values.map((value) => Number((value * 10_000n) / total));
  const remainders = values.map((value, index) => ({
    index,
    value: (value * 10_000n) % total,
  }));
  let remaining = 10_000 - floors.reduce((sum, value) => sum + value, 0);
  remainders.sort((left, right) => {
    if (left.value !== right.value) return left.value > right.value ? -1 : 1;
    return left.index - right.index;
  });
  for (const remainder of remainders) {
    if (remaining === 0) break;
    floors[remainder.index] += 1;
    remaining -= 1;
  }
  return floors;
}

function dayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

function enumerateDays(startDate: string, endDateExclusive: string) {
  const result: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDateExclusive}T00:00:00Z`);
  while (cursor < end) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export function buildDailyExpenseChartContract(
  interval: DateInterval,
  rows: DailyExpenseAggregate[],
) {
  const byDay = new Map(rows.map((row) => [row.day, row.expense]));
  const days = enumerateDays(interval.startDate, interval.endDateExclusive);
  const filled = days.map((day) => ({
    day,
    expense: byDay.get(day) ?? 0n,
  }));
  const maximum = filled.reduce(
    (value, item) => (item.expense > value ? item.expense : value),
    0n,
  );
  const totalExpense = filled.reduce((sum, item) => sum + item.expense, 0n);

  const points: DailyExpensePoint[] = filled.map((item) => ({
    day: item.day,
    label: dayLabel(item.day),
    expenseIdr: item.expense.toString(),
    plot: normalizedPlot(item.expense, maximum),
  }));

  return { points, totalExpense };
}

type IncomeExpensePeriod = {
  period: string;
  income: bigint;
  expense: bigint;
};

function compactDayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

function weekStartLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

function compactMonthLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("id-ID", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return `${monthName} ${String(year).slice(-2)}`;
}

function enumerateWeeks(startDate: string, endDateExclusive: string) {
  const result: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDateExclusive}T00:00:00Z`);
  while (cursor < end) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return result;
}

function enumerateMonths(startDate: string, endDateExclusive: string) {
  const result: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDateExclusive}T00:00:00Z`);
  while (cursor < end) {
    result.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return result;
}

function buildIncomeExpenseSeries(
  periodKeys: string[],
  rows: IncomeExpensePeriod[],
  labelOf: (period: string) => string,
) {
  const byPeriod = new Map(rows.map((row) => [row.period, row]));
  const filled = periodKeys.map(
    (period) => byPeriod.get(period) ?? { period, income: 0n, expense: 0n },
  );
  const maximum = filled.reduce(
    (value, item) =>
      item.income > value
        ? item.income
        : item.expense > value
          ? item.expense
          : value,
    0n,
  );
  const totalIncome = filled.reduce((sum, item) => sum + item.income, 0n);
  const totalExpense = filled.reduce((sum, item) => sum + item.expense, 0n);

  const points: IncomeExpensePoint[] = filled.map((item) => ({
    period: item.period,
    label: labelOf(item.period),
    incomeIdr: item.income.toString(),
    expenseIdr: item.expense.toString(),
    incomePlot: normalizedPlot(item.income, maximum),
    expensePlot: normalizedPlot(item.expense, maximum),
  }));

  return { points, totalIncome, totalExpense };
}

export function buildDailyCashFlowContract(
  interval: DateInterval,
  rows: IncomeExpensePeriod[],
) {
  const days = enumerateDays(interval.startDate, interval.endDateExclusive);
  return buildIncomeExpenseSeries(days, rows, compactDayLabel);
}

export function buildWeeklyCashFlowContract(
  interval: DateInterval,
  rows: IncomeExpensePeriod[],
) {
  const weeks = enumerateWeeks(interval.startDate, interval.endDateExclusive);
  return buildIncomeExpenseSeries(weeks, rows, weekStartLabel);
}

export function buildMonthlyCashFlowContract(
  interval: DateInterval,
  rows: IncomeExpensePeriod[],
) {
  const months = enumerateMonths(interval.startDate, interval.endDateExclusive);
  return buildIncomeExpenseSeries(months, rows, compactMonthLabel);
}

export function buildFourDayExpenseChartContract(
  now: Date,
  rows: DailyExpenseAggregate[],
) {
  const interval = fourDayJakartaInterval(now);
  const { points, totalExpense } = buildDailyExpenseChartContract(
    interval,
    rows,
  );
  return { interval, points, totalExpense };
}

export function buildCategoryChartContract(rows: CategoryAggregate[]) {
  const sorted = [...rows].sort((left, right) => {
    if (left.expense !== right.expense) {
      return left.expense > right.expense ? -1 : 1;
    }
    const byName = left.normalizedName.localeCompare(
      right.normalizedName,
      "id-ID",
    );
    return byName || left.categoryId.localeCompare(right.categoryId);
  });
  const totalExpense = sorted.reduce((sum, item) => sum + item.expense, 0n);
  const shares = roundedShares(
    sorted.map((item) => item.expense),
    totalExpense,
  );

  const points: CategoryExpensePoint[] = sorted.map((item, index) => ({
    categoryId: item.categoryId,
    name: item.name,
    color: CATEGORY_COLORS[item.color ?? ""] ?? CATEGORY_COLORS.slate,
    icon: item.icon,
    expenseIdr: item.expense.toString(),
    shareBps: shares[index],
    rank: index + 1,
  }));

  return { points, totalExpense };
}

export function buildCategoryVisualPoints(points: CategoryExpensePoint[]) {
  if (points.length <= 5) return points;
  const visible = points.slice(0, 5);
  const remainder = points.slice(5);
  return [
    ...visible,
    {
      categoryId: "__other__",
      name: "Kategori lainnya",
      color: CATEGORY_COLORS.slate,
      icon: null,
      expenseIdr: remainder
        .reduce((sum, item) => sum + BigInt(item.expenseIdr), 0n)
        .toString(),
      shareBps: remainder.reduce((sum, item) => sum + item.shareBps, 0),
      rank: 6,
    },
  ];
}
