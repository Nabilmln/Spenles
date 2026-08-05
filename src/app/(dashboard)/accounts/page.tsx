import Link from "next/link";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { AccountList, listOwnedAccounts } from "@/modules/accounts";

export const metadata = { title: "Akun" };
export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedAccounts(user.id);
  return (
    <div className="page-stack">
      <div className="page-heading-row">
        <SectionHeading
          eyebrow="Akun"
          title="Akun dan dompet"
          description="Saldo dihitung di server dari transaksi aktif dan transfer."
        />
        <div className="form-actions">
          <Link className="button button-secondary" href="/transfers">Transfer</Link>
          <Link className="button button-primary" href="/accounts/new">Tambah akun</Link>
        </div>
      </div>
      <AccountList rows={rows} />
    </div>
  );
}
