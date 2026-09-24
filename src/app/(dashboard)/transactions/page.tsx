import { Suspense } from "react";
import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
import {
  ContentCardSkeleton,
  ContentSkeleton,
} from "@/components/feedback/content-skeleton";
import {
  ExpenseOverviewCard,
  getExpenseOverview,
  getTransactionOptions,
  getTransactionSummary,
  listTransactionHistory,
  parseTransactionFilters,
  TransactionHistorySection,
  TransactionSummary,
} from "@/modules/transactions";

export const dynamic = "force-dynamic";

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 15;

type TransactionFilterData = Extract<
  ReturnType<typeof parseTransactionFilters>,
  { success: true }
>["data"];

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransactionsPage({
  searchParams,
}: PageProps) {
  const user = await requireSessionUser();
  const raw = await searchParams;
  const parsed = parseTransactionFilters(raw);

  const filters = {
    page: INITIAL_PAGE,
    pageSize: INITIAL_PAGE_SIZE,
  } as const;

  if (!parsed.success) {
    return (
      <div className={pageStackClass}>
        <TransactionHistorySection
          filters={{
            ...filters,
            q: "",
            sort: "transactionAt",
            direction: "desc",
          }}
          accounts={[]}
          categories={[]}
          initialRows={[]}
          total={0}
        />
      </div>
    );
  }

  const accounts = getTransactionOptions(user.id);
  const summary = getTransactionSummary(user.id, parsed.data);
  const overview = getExpenseOverview(user.id);
  const history = listTransactionHistory(user.id, {
    ...parsed.data,
    ...filters,
  });

  return (
    <div className={pageStackClass}>
      <Suspense fallback={<ContentCardSkeleton className="h-[7rem]" />}>
        <OverviewPanel overview={overview} />
      </Suspense>

      <Suspense fallback={<ContentCardSkeleton className="h-[5rem]" />}>
        <SummaryPanel summary={summary} />
      </Suspense>

      <Suspense
        fallback={<ContentSkeleton />}
      >
        <HistoryPanel
          accounts={accounts}
          filters={parsed.data}
          history={history}
        />
      </Suspense>
    </div>
  );
}

async function OverviewPanel({
  overview,
}: {
  overview: ReturnType<typeof getExpenseOverview>;
}) {
  const result = await overview;
  return <ExpenseOverviewCard points={result.points} />;
}

async function SummaryPanel({
  summary,
}: {
  summary: ReturnType<typeof getTransactionSummary>;
}) {
  const result = await summary;
  return (
    <TransactionSummary
      income={result.income}
      expense={result.expense}
      savings={result.savings}
    />
  );
}

async function HistoryPanel({
  accounts,
  filters,
  history,
}: {
  accounts: ReturnType<typeof getTransactionOptions>;
  filters: TransactionFilterData;
  history: ReturnType<typeof listTransactionHistory>;
}) {
  const [options, result] = await Promise.all([accounts, history]);
  return (
    <TransactionHistorySection
      filters={{ ...filters, page: INITIAL_PAGE, pageSize: INITIAL_PAGE_SIZE }}
      accounts={options.accounts}
      categories={options.categories}
      initialRows={result.rows}
      total={result.total}
    />
  );
}