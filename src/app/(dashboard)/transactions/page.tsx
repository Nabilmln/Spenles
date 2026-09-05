import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
import {
  ExpenseOverviewCard,
  getExpenseOverview,
  getTransactionOptions,
  getTransactionSummary,
  listTransactions,
  parseTransactionFilters,
  TransactionHistorySection,
  TransactionSummary,
} from "@/modules/transactions";

export const dynamic = "force-dynamic";

const INITIAL_PAGE = 1;
const INITIAL_PAGE_SIZE = 15;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireSessionUser();
  const raw = await searchParams;
  const parsed = parseTransactionFilters(raw);
  if (!parsed.success) {
    return (
      <div className={pageStackClass}>
        <TransactionHistorySection
          filters={{
            q: "",
            sort: "transactionAt",
            direction: "desc",
            page: INITIAL_PAGE,
            pageSize: INITIAL_PAGE_SIZE,
          }}
          accounts={[]}
          categories={[]}
          initialRows={[]}
          total={0}
        />
      </div>
    );
  }

  const [result, options, summary, overview] = await Promise.all([
    listTransactions(user.id, {
      ...parsed.data,
      page: INITIAL_PAGE,
      pageSize: INITIAL_PAGE_SIZE,
    }),
    getTransactionOptions(user.id),
    getTransactionSummary(user.id, parsed.data),
    getExpenseOverview(user.id),
  ]);

  return (
    <div className={pageStackClass}>
      <ExpenseOverviewCard
        points={overview.points}
        totalExpense={overview.totalExpense}
        totalIncome={overview.totalIncome}
      />
      <TransactionSummary
        income={summary.income}
        expense={summary.expense}
        savings={summary.savings}
      />
      <TransactionHistorySection
        filters={{
          ...parsed.data,
          page: INITIAL_PAGE,
          pageSize: INITIAL_PAGE_SIZE,
        }}
        accounts={options.accounts}
        categories={options.categories}
        initialRows={result.rows}
        total={result.total}
      />
    </div>
  );
}