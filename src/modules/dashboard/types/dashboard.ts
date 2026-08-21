import { JAKARTA_TIMEZONE } from "@/lib/dates/jakarta";

export const DASHBOARD_TIMEZONE = JAKARTA_TIMEZONE;

export type DashboardPreset =
  | "current-month"
  | "previous-month"
  | "last-3-months"
  | "last-6-months"
  | "current-year";

export type DashboardSelection =
  | { kind: "preset"; period: DashboardPreset }
  | { kind: "month"; month: string }
  | { kind: "custom"; from: string; to: string };

export type DashboardFilters = {
  selection: DashboardSelection;
};

export type DashboardSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type DateInterval = {
  start: Date;
  end: Date;
  startDate: string;
  endDateExclusive: string;
  label: string;
};

export type DashboardPeriods = {
  selected: DateInterval;
  previous: DateInterval;
  selectedMonthKeys: string[];
};

export type AggregateTotals = {
  income: bigint;
  expense: bigint;
};

export type TotalsComparison = {
  current: bigint;
  previous: bigint;
  delta: bigint;
  state:
    | "increase"
    | "decrease"
    | "unchanged"
    | "new"
    | "unchanged-zero"
    | "absolute-only";
  changeBps: string | null;
};

export type FinancialCondition =
  | "healthy"
  | "attention"
  | "deficit"
  | "no-data";

export type MonthlyAggregate = {
  period: string;
  income: bigint;
  expense: bigint;
};

export type DailyExpenseAggregate = {
  day: string;
  expense: bigint;
};

export type CategoryAggregate = {
  categoryId: string;
  name: string;
  normalizedName: string;
  color: string | null;
  icon: string | null;
  expense: bigint;
};

export type MonthlyExpensePoint = {
  period: string;
  label: string;
  expenseIdr: string;
  plot: number;
};

export type DailyExpensePoint = {
  day: string;
  label: string;
  expenseIdr: string;
  plot: number;
};

export type IncomeExpensePoint = {
  period: string;
  label: string;
  incomeIdr: string;
  expenseIdr: string;
  incomePlot: number;
  expensePlot: number;
};

export type CategoryExpensePoint = {
  categoryId: string;
  name: string;
  color: string;
  icon: string | null;
  expenseIdr: string;
  shareBps: number;
  rank: number;
};

export type RecentDashboardTransaction = {
  id: string;
  type: "income" | "expense";
  amountIdr: string;
  transactionAt: Date;
  note: string | null;
  accountName: string;
  categoryName: string;
};
