import { cardClass } from "@/components/ui/styles";
import type { AccountBalanceRow } from "@/modules/accounts";
import { AverageSpendingCard } from "./average-spending-card";
import { CashFlowOverviewCard } from "./cash-flow-overview-card";
import { CategoryExpenseCard } from "./category-expense-card";
import { DashboardAccountCard } from "./dashboard-account-card";
import { DashboardSectionError } from "./dashboard-section-error";
import { FinancialOverview } from "./financial-overview";
import { IncomeVsExpenseComparison } from "./income-vs-expense-comparison";
import { MobileBalanceCard } from "./mobile-balance-card";
import { MonthlyExpenseCard } from "./monthly-expense-card";
import { RecentActivityCard } from "./recent-activity";
import { SavingsSummaryCard } from "./savings-summary-card";
import { TopSpendingCard } from "./top-spending-card";
import {
  buildCategoryChartContract,
  buildDailyCashFlowContract,
  buildDailyExpenseChartContract,
  buildFourDayExpenseChartContract,
  buildMonthlyCashFlowContract,
  buildWeeklyCashFlowContract,
} from "../services/chart-contracts";
import { compareFinancialValue } from "../services/financial-metrics";
import type {
  AggregateTotals,
  CategoryAggregate,
  DailyExpenseAggregate,
  DailyExpensePoint,
  DateInterval,
  IncomeExpensePoint,
  MonthlyAggregate,
  RecentDashboardTransaction,
} from "../types/dashboard";

type Totals = { selected: AggregateTotals; previous: AggregateTotals };

type IncomeExpensePeriod = {
  period: string;
  income: bigint;
  expense: bigint;
};

type SavingsPeriodNet = { savedIn: bigint; savedOut: bigint; net: bigint };

type CashFlowSeries = {
  points: IncomeExpensePoint[];
  totalIncome: string;
  totalExpense: string;
};

export function DashboardCardSkeleton({ label }: { label: string }) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className={`${cardClass} flex h-full min-h-[9rem] flex-col gap-[.75rem] shadow-none`}
    >
      <span className="sr-only">Loading {label}...</span>
      <div className="flex items-center gap-[.5rem]">
        <div className="size-[2rem] animate-pulse rounded-[.55rem] bg-surface-subtle" />
        <div className="h-[.7rem] w-[6rem] animate-pulse rounded-[.3rem] bg-surface-subtle" />
      </div>
      <div className="h-[1.35rem] w-[7.5rem] animate-pulse rounded-[.35rem] bg-surface-subtle" />
      <div className="mt-auto h-[.7rem] w-full max-w-[13rem] animate-pulse rounded-[.3rem] bg-surface-subtle" />
    </section>
  );
}

export async function DashboardBalanceSection({
  totalsPromise,
  accountsPromise,
  name,
}: {
  totalsPromise: Promise<Totals>;
  accountsPromise: Promise<AccountBalanceRow[]>;
  name: string;
}) {
  let income = 0n;
  let expense = 0n;
  let activeAccounts: AccountBalanceRow[] = [];
  try {
    const [totals, accounts] = await Promise.all([
      totalsPromise,
      accountsPromise,
    ]);
    income = totals.selected.income;
    expense = totals.selected.expense;
    activeAccounts = accounts.filter((account) => account.status === "active");
  } catch {
    // Balance cards always render with a zero fallback state.
  }
  const totalBalance = activeAccounts.reduce(
    (sum, account) => sum + BigInt(account.balance),
    0n,
  );
  return (
    <>
      <div className="hidden min-[861px]:block">
        <FinancialOverview
          name={name}
          income={income.toString()}
          expense={expense.toString()}
        />
      </div>
      <div className="min-[861px]:hidden">
        <MobileBalanceCard
          accounts={activeAccounts}
          balance={totalBalance}
          income={income}
          expense={expense}
        />
      </div>
    </>
  );
}

export async function DashboardComparisonSection({
  totalsPromise,
  previousLabel,
}: {
  totalsPromise: Promise<Totals>;
  previousLabel: string;
}) {
  let totals: Totals | null = null;
  try {
    totals = await totalsPromise;
  } catch {
    return <DashboardSectionError title="Monthly comparison not available yet" />;
  }
  const incomeComparison = compareFinancialValue(
    totals.selected.income,
    totals.previous.income,
  );
  const expenseComparison = compareFinancialValue(
    totals.selected.expense,
    totals.previous.expense,
  );
  return (
    <IncomeVsExpenseComparison
      income={totals.selected.income}
      expense={totals.selected.expense}
      incomeChangeBps={incomeComparison?.changeBps ?? null}
      expenseChangeBps={expenseComparison?.changeBps ?? null}
      previousLabel={previousLabel}
    />
  );
}

export async function DashboardSavingsSection({
  savingsPromise,
  balancePromise,
}: {
  savingsPromise: Promise<SavingsPeriodNet>;
  balancePromise: Promise<bigint>;
}) {
  let savings: SavingsPeriodNet | null = null;
  let balance = 0n;
  try {
    const [net, balanceTotal] = await Promise.all([
      savingsPromise,
      balancePromise,
    ]);
    savings = net;
    balance = balanceTotal;
  } catch {
    return <DashboardSectionError title="Savings summary not available yet" />;
  }
  return <SavingsSummaryCard balance={balance} periodNet={savings.net} />;
}

export async function DashboardMonthlyExpenseSection({
  dailyPromise,
  recentPromise,
  totalsPromise,
  cardInterval,
  cardMonth,
  monthLabel,
  nextMonth,
  now,
  prevMonth,
}: {
  dailyPromise: Promise<DailyExpenseAggregate[]>;
  recentPromise: Promise<DailyExpenseAggregate[]>;
  totalsPromise: Promise<Totals>;
  cardInterval: DateInterval;
  cardMonth: string;
  monthLabel: string;
  nextMonth: string;
  now: Date;
  prevMonth: string;
}) {
  let contract: {
    points: DailyExpensePoint[];
    totalExpense: bigint;
  } | null = null;
  try {
    contract = buildDailyExpenseChartContract(
      cardInterval,
      await dailyPromise,
    );
  } catch {
    return <DashboardSectionError title="Monthly expenses not available yet" />;
  }
  const recentPoints = buildFourDayExpenseChartContract(
    now,
    await recentPromise.catch(() => []),
  ).points;
  let totalIncome = 0n;
  try {
    totalIncome = (await totalsPromise).selected.income;
  } catch {
    // Monthly expense card falls back to zero income.
  }
  return (
    <MonthlyExpenseCard
      currentMonth={cardMonth}
      monthLabel={monthLabel}
      monthPoints={contract.points}
      nextMonth={nextMonth}
      prevMonth={prevMonth}
      recentPoints={recentPoints}
      totalExpense={contract.totalExpense}
      totalIncome={totalIncome}
    />
  );
}

function toCashFlowSeries(
  contract: {
    points: IncomeExpensePoint[];
    totalIncome: bigint;
    totalExpense: bigint;
  } | null,
): CashFlowSeries {
  return contract
    ? {
        points: contract.points,
        totalIncome: contract.totalIncome.toString(),
        totalExpense: contract.totalExpense.toString(),
      }
    : { points: [], totalIncome: "0", totalExpense: "0" };
}

export async function DashboardCashFlowSection({
  dailyPromise,
  weeklyPromise,
  monthlyPromise,
  daysInterval,
  weeksInterval,
  monthsInterval,
}: {
  dailyPromise: Promise<IncomeExpensePeriod[]>;
  weeklyPromise: Promise<IncomeExpensePeriod[]>;
  monthlyPromise: Promise<MonthlyAggregate[]>;
  daysInterval: DateInterval;
  weeksInterval: DateInterval;
  monthsInterval: DateInterval;
}) {
  let daily: CashFlowSeries = { points: [], totalIncome: "0", totalExpense: "0" };
  try {
    daily = toCashFlowSeries(
      buildDailyCashFlowContract(daysInterval, await dailyPromise),
    );
  } catch {
    // Cash flow card shows empty series.
  }
  let weekly: CashFlowSeries = { points: [], totalIncome: "0", totalExpense: "0" };
  try {
    weekly = toCashFlowSeries(
      buildWeeklyCashFlowContract(weeksInterval, await weeklyPromise),
    );
  } catch {
    // Cash flow card shows empty series.
  }
  let monthly: CashFlowSeries = { points: [], totalIncome: "0", totalExpense: "0" };
  try {
    monthly = toCashFlowSeries(
      buildMonthlyCashFlowContract(monthsInterval, await monthlyPromise),
    );
  } catch {
    // Cash flow card shows empty series.
  }
  return <CashFlowOverviewCard daily={daily} monthly={monthly} weekly={weekly} />;
}

export async function DashboardCategorySection({
  categoryPromise,
  periodLabel,
}: {
  categoryPromise: Promise<CategoryAggregate[]>;
  periodLabel: string;
}) {
  let rows: CategoryAggregate[] = [];
  try {
    rows = await categoryPromise;
  } catch {
    return <DashboardSectionError title="Category expenses not available yet" />;
  }
  const contract = buildCategoryChartContract(rows);
  return (
    <CategoryExpenseCard
      periodLabel={periodLabel}
      points={contract.points}
      totalExpense={contract.totalExpense}
    />
  );
}

export async function DashboardTopSpendingSection({
  categoryPromise,
  periodLabel,
}: {
  categoryPromise: Promise<CategoryAggregate[]>;
  periodLabel: string;
}) {
  let rows: CategoryAggregate[] = [];
  try {
    rows = await categoryPromise;
  } catch {
    return <DashboardSectionError title="Top categories not available yet" />;
  }
  return <TopSpendingCard periodLabel={periodLabel} rows={rows} />;
}

export async function DashboardRecentActivitySection({
  activityPromise,
}: {
  activityPromise: Promise<RecentDashboardTransaction[]>;
}) {
  let rows: RecentDashboardTransaction[] = [];
  try {
    rows = await activityPromise;
  } catch {
    return <DashboardSectionError title="Recent activity not available yet" />;
  }
  return <RecentActivityCard rows={rows} />;
}

export async function DashboardAveragesSection({
  totalsPromise,
  accountsPromise,
  calendarDays,
  prevCalendarDays,
  previousLabel,
}: {
  totalsPromise: Promise<Totals>;
  accountsPromise: Promise<AccountBalanceRow[]>;
  calendarDays: number;
  prevCalendarDays: number;
  previousLabel: string;
}) {
  let totals: Totals | null = null;
  let activeAccounts: AccountBalanceRow[] = [];
  try {
    const [totalsResult, accounts] = await Promise.all([
      totalsPromise,
      accountsPromise,
    ]);
    totals = totalsResult;
    activeAccounts = accounts.filter((account) => account.status === "active");
  } catch {
    // Average falls back to an error state; account list stays empty.
  }
  const averageDaily = totals
    ? totals.selected.expense / BigInt(calendarDays)
    : 0n;
  const prevAverageDaily = totals
    ? totals.previous.expense / BigInt(prevCalendarDays)
    : 0n;
  const averageComparison = compareFinancialValue(averageDaily, prevAverageDaily);
  return (
    <div className="grid gap-3">
      {totals ? (
        <AverageSpendingCard
          value={averageDaily}
          changeBps={averageComparison.changeBps}
          previousLabel={previousLabel}
        />
      ) : (
        <DashboardSectionError title="Daily average not available yet" />
      )}
      <DashboardAccountCard rows={activeAccounts} />
    </div>
  );
}