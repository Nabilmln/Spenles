import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, pageStackClass } from "@/components/ui/styles";
import { AccountTotalCard, AccountList, listOwnedAccounts } from "@/modules/accounts";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireSessionUser();
  const rows = await listOwnedAccounts(user.id);
  const total = rows.reduce(
    (sum, row) => sum + BigInt(row.balance),
    0n,
  );

  return (
    <div className={pageStackClass}>
      <AccountTotalCard total={total} />

      <Link className={`${buttonClass("primary")} justify-center`} href="/accounts/new">
        <Plus size={18} aria-hidden="true" />
        Add Account
      </Link>

      <div>
        <h2 className="mb-[.8rem] m-0 text-[.78rem] font-semibold uppercase tracking-[.12em] text-muted">
          Accounts
        </h2>
        <AccountList rows={rows} />
      </div>
    </div>
  );
}