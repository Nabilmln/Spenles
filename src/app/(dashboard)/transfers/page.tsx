import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import {
  listActiveAccountOptions,
  listOwnedTransfers,
  TransferForm,
  TransferList,
} from "@/modules/accounts";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const user = await requireSessionUser();
  const [accounts, rows] = await Promise.all([
    listActiveAccountOptions(user.id),
    listOwnedTransfers(user.id),
  ]);
  return (
    <div className={pageStackClass}>
      <p className={pageDescriptionClass}>Transfers are not counted as income or expenses.</p>
      <div className="grid grid-cols-1 items-start gap-4">
        <section className={cardClass}>
          <h2>New transfer</h2>
          {accounts.length >= 2 ? (
            <TransferForm accounts={accounts} />
          ) : (
            <p>Add at least two active accounts to create a transfer.</p>
          )}
        </section>
        <section>
          <h2>Transfer history</h2>
          <TransferList rows={rows} />
        </section>
      </div>
    </div>
  );
}
