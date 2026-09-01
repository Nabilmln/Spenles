import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass, narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import { formatJakartaDate } from "@/lib/dates/jakarta";
import { createTransactionAction, getTransactionOptions, TransactionForm } from "@/modules/transactions";

export default async function NewTransactionPage() {
  const user = await requireSessionUser();
  const options = await getTransactionOptions(user.id);
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>All times are shown in the Asia/Jakarta timezone.</p>
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
