import Link from "next/link";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, pageActionsClass, pageDescriptionClass, pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
import { AccountList, listOwnedAccounts } from "@/modules/accounts";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedAccounts(user.id);
  return (
    <div className={pageStackClass}>
      <div className={pageHeadingRowClass}>
        <p className={pageDescriptionClass}>Saldo dihitung di server dari transaksi aktif dan transfer.</p>
        <div className={pageActionsClass}>
          <Link className={buttonClass("secondary")} href="/transfers">Transfer</Link>
          <Link className={buttonClass("primary")} href="/accounts/new">Tambah akun</Link>
        </div>
      </div>
      <AccountList rows={rows} />
    </div>
  );
}
