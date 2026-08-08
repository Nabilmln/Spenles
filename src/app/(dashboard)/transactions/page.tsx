import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass } from "@/components/ui/styles";
import {
  getTransactionOptions,
  getTransactionSummary,
  listTransactions,
  Pagination,
  parseTransactionFilters,
  TransactionFilterBar,
  TransactionList,
  TransactionSummary,
} from "@/modules/transactions";

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
      <div className="page-stack">
        <div className={cardClass}><p className="m-0 text-muted">Parameter pencarian atau filter tidak dapat digunakan.</p><Link className={buttonClass("primary")} href="/transactions">Reset filter</Link></div>
      </div>
    );
  }
  const [result, options, summary] = await Promise.all([
    listTransactions(user.id, parsed.data),
    getTransactionOptions(user.id),
    getTransactionSummary(user.id, parsed.data),
  ]);
  return (
    <div className="page-stack">
      <p className="page-description">Catat dan temukan pemasukan, pengeluaran, maupun tabungan Anda.</p>
      <TransactionSummary income={summary.income} expense={summary.expense} savings={summary.savings} />
      <TransactionFilterBar filters={parsed.data} {...options} />
      <TransactionList rows={result.rows} />
      <Pagination filters={parsed.data} total={result.total} totalPages={result.totalPages} />
    </div>
  );
}
