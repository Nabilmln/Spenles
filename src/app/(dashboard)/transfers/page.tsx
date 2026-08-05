import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  listActiveAccountOptions,
  listOwnedTransfers,
  TransferForm,
  TransferList,
} from "@/modules/accounts";

export const metadata = { title: "Transfer internal" };
export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const user = await requireSessionUser();
  const [accounts, rows] = await Promise.all([
    listActiveAccountOptions(user.id),
    listOwnedTransfers(user.id),
  ]);
  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="Akun"
        title="Transfer internal"
        description="Transfer tidak dihitung sebagai pemasukan atau pengeluaran."
      />
      <div className="domain-layout">
        <section className="card">
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
