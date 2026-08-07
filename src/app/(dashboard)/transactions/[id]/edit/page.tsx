import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDate } from "@/lib/dates/jakarta";
import { getTransaction, getTransactionOptions, TransactionForm, updateTransactionAction } from "@/modules/transactions";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSessionUser();
  const { id } = await params;
  const transaction = await getTransaction(user.id, id);
  if (!transaction) notFound();
  const options = await getTransactionOptions(user.id, transaction.categoryId);
  return (
    <div className="page-stack narrow-page">
      <div className="card">
        <TransactionForm
          action={updateTransactionAction}
          {...options}
          initial={{
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount.toString(),
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            transactionAt: formatJakartaDate(transaction.transactionAt),
            note: transaction.note ?? "",
          }}
        />
      </div>
    </div>
  );
}
