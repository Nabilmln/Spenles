import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import { createTransactionAction, getTransactionOptions, TransactionForm } from "@/modules/transactions";

export default async function NewTransactionPage() {
  const user = await requireSessionUser();
  const options = await getTransactionOptions(user.id);
  return (
    <div className="page-stack narrow-page">
      <div className="section-heading"><p className="eyebrow">Transaksi</p><h1>Tambah transaksi</h1><p>Semua waktu ditampilkan dalam zona Asia/Jakarta.</p></div>
      <div className="card">
        <TransactionForm
          action={createTransactionAction}
          {...options}
          defaultTransactionAt={formatJakartaDateTimeInput(new Date())}
        />
      </div>
    </div>
  );
}
