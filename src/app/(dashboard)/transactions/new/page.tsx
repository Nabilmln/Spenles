import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass } from "@/components/ui/styles";
import { formatJakartaDate } from "@/lib/dates/jakarta";
import { createTransactionAction, getTransactionOptions, TransactionForm } from "@/modules/transactions";

export default async function NewTransactionPage() {
  const user = await requireSessionUser();
  const options = await getTransactionOptions(user.id);
  return (
    <div className="page-stack narrow-page">
      <p className="page-description">Semua waktu ditampilkan dalam zona Asia/Jakarta.</p>
      <div className={cardClass}>
        <TransactionForm
          action={createTransactionAction}
          {...options}
          defaultDate={formatJakartaDate(new Date())}
        />
      </div>
    </div>
  );
}
