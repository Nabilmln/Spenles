import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
import { AccountTotalCard, AccountList, listOwnedAccounts } from "@/modules/accounts";
import { getProfile } from "@/modules/profiles";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireSessionUser();
  const [rows, profile] = await Promise.all([listOwnedAccounts(user.id), getProfile(user.id)]);
  const total = rows.reduce(
    (sum, row) => sum + BigInt(row.balance),
    0n,
  );

  return (
    <div className={pageStackClass}>
      <AccountTotalCard total={total} />

      <div>
        <h2 className="mb-[.8rem] m-0 text-[.78rem] font-semibold uppercase tracking-[.12em] text-muted">
          Accounts
        </h2>
        <AccountList rows={rows} homeAccountId={profile?.homeAccountId ?? null} />
      </div>
    </div>
  );
}
