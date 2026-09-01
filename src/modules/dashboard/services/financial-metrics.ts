import type {
  AggregateTotals,
  CategoryAggregate,
  FinancialCondition,
  MonthlyAggregate,
  TotalsComparison,
} from "../types/dashboard";

function abs(value: bigint) {
  return value < 0n ? -value : value;
}

function divideHalfUp(value: bigint, divisor: bigint) {
  if (divisor <= 0n) throw new Error("Divisor must be positive.");
  if (value >= 0n) return (value + divisor / 2n) / divisor;
  return -((-value + divisor / 2n) / divisor);
}

function percentageBps(delta: bigint, baseline: bigint) {
  const rounded = divideHalfUp(abs(delta) * 10_000n, baseline);
  return (delta < 0n ? -rounded : rounded).toString();
}

export function compareFinancialValue(
  current: bigint,
  previous: bigint,
): TotalsComparison {
  const delta = current - previous;

  if (previous < 0n || (previous === 0n && current < 0n)) {
    return {
      current,
      previous,
      delta,
      state: "absolute-only",
      changeBps: null,
    };
  }

  if (previous === 0n) {
    return {
      current,
      previous,
      delta,
      state: current === 0n ? "unchanged-zero" : "new",
      changeBps: null,
    };
  }

  return {
    current,
    previous,
    delta,
    state:
      delta > 0n ? "increase" : delta < 0n ? "decrease" : "unchanged",
    changeBps: percentageBps(delta, previous),
  };
}

export function calculateExpenseRatioBps(income: bigint, expense: bigint) {
  if (income === 0n) return null;
  return divideHalfUp(expense * 10_000n, income).toString();
}

export function formatChangeBps(value: string) {
  const bps = BigInt(value);
  const absolute = bps < 0n ? -bps : bps;
  return `${(absolute / 100n).toLocaleString("en-US")},${String(
    absolute % 100n,
  ).padStart(2, "0")}%`;
}

export function classifyFinancialCondition(
  income: bigint,
  expense: bigint,
): FinancialCondition {
  if (income === 0n && expense === 0n) return "no-data";
  const net = income - expense;
  if (net < 0n || (income === 0n && expense > 0n)) return "deficit";

  if (expense * 100n > income * 90n) return "deficit";
  if (expense * 100n < income * 70n) return "healthy";
  return "attention";
}

function selectLargestCategory(categories: CategoryAggregate[]) {
  return [...categories].sort((left, right) => {
    if (left.expense !== right.expense) {
      return left.expense > right.expense ? -1 : 1;
    }
    const byName = left.normalizedName.localeCompare(
      right.normalizedName,
      "en-US",
    );
    return byName || left.categoryId.localeCompare(right.categoryId);
  })[0] ?? null;
}

function selectHighestExpenseMonth(monthly: MonthlyAggregate[]) {
  const withExpense = monthly.filter((item) => item.expense > 0n);
  return [...withExpense].sort((left, right) => {
    if (left.expense !== right.expense) {
      return left.expense > right.expense ? -1 : 1;
    }
    return left.period.localeCompare(right.period);
  })[0] ?? null;
}

export function buildFinancialSnapshot(
  current: AggregateTotals,
  previous: AggregateTotals,
  monthly: MonthlyAggregate[],
  categories: CategoryAggregate[],
  includedMonthCount: number,
) {
  if (includedMonthCount < 1) {
    throw new Error("At least one calendar month must be included.");
  }

  const divisor = BigInt(includedMonthCount);
  const net = current.income - current.expense;
  const previousNet = previous.income - previous.expense;
  const averageIncome = divideHalfUp(current.income, divisor);
  const averageExpense = divideHalfUp(current.expense, divisor);

  return {
    income: current.income,
    expense: current.expense,
    net,
    incomeComparison: compareFinancialValue(
      current.income,
      previous.income,
    ),
    expenseComparison: compareFinancialValue(
      current.expense,
      previous.expense,
    ),
    netComparison: compareFinancialValue(net, previousNet),
    expenseRatioBps: calculateExpenseRatioBps(
      current.income,
      current.expense,
    ),
    condition: classifyFinancialCondition(current.income, current.expense),
    averageIncome,
    averageExpense,
    averageNet: averageIncome - averageExpense,
    includedMonthCount,
    monthsWithData: monthly.filter(
      (item) => item.income > 0n || item.expense > 0n,
    ).length,
    largestExpenseCategory: selectLargestCategory(categories),
    highestExpenseMonth: selectHighestExpenseMonth(monthly),
  };
}

export type FinancialSnapshot = ReturnType<typeof buildFinancialSnapshot>;
