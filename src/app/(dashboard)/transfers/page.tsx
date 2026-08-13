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
      <p className={pageDescriptionClass}>Transfer tidak dihitung sebagai pemasukan atau pengeluaran.</p>
      <div className="grid grid-cols-[minmax(18rem,.75fr)_minmax(0,1.25fr)] items-start gap-4 max-[860px]:grid-cols-1">
        <section className={cardClass}>
          <h2>Transfer baru</h2>
          {accounts.length >= 2 ? (
            <TransferForm accounts={accounts} />
          ) : (
            <p>Tambahkan sedikitnya dua akun aktif untuk membuat transfer.</p>
          )}
        </section>
        <section>
          <h2>Riwayat transfer</h2>
          <TransferList rows={rows} />
        </section>
      </div>
    </div>
  );
}
