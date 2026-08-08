import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { formatIdr } from "@/lib/money/format-idr";
import { getOwnedAccount } from "@/modules/accounts";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser();
  const { id } = await params;
  const account = await getOwnedAccount(user.id, id);
  if (!account) notFound();
  const negative = BigInt(account.balance) < 0n;
  return (
    <div className="page-stack narrow-page">
      <div className="page-heading-row">
        <div className="page-heading-copy">
          <h2 className="entity-heading">{account.name}</h2>
          <p className="page-description">{account.status === "active" ? "Akun aktif" : "Akun diarsipkan"}</p>
        </div>
        <Link className={buttonClass("secondary")} href={`/accounts/${account.id}/edit`}>Edit</Link>
      </div>
      <section className={`${cardClass} account-detail`}>
        <p>Saldo saat ini</p>
        <strong className={negative ? "negative-balance" : undefined}>{formatIdr(account.balance)}</strong>
        {negative ? <p className="warning-copy">Saldo akun negatif.</p> : null}
        <p>Saldo awal: {formatIdr(account.openingBalance)}</p>
      </section>
    </div>
  );
}
