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
      <div className="grid grid-cols-[minmax(18rem,.75fr)_minmax(0,1.25fr)] items-start gap-4 max-[860px]:grid-cols-1">
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
