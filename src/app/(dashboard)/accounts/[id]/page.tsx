import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatIdr } from "@/lib/money/format-idr";
import { getOwnedAccount } from "@/modules/accounts";
import { accountTypeLabel } from "@/modules/accounts/constants/account-types";

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
        <SectionHeading
          eyebrow={accountTypeLabel(account.type)}
          title={account.name}
          description={account.status === "active" ? "Akun aktif" : "Akun diarsipkan"}
        />
        <Link className="button button-secondary" href={`/accounts/${account.id}/edit`}>Edit</Link>
      </div>
      <section className="card account-detail">
        <p>Saldo saat ini</p>
        <strong className={negative ? "negative-balance" : undefined}>{formatIdr(account.balance)}</strong>
        {negative ? <p className="warning-copy">Saldo akun negatif.</p> : null}
        <p>Saldo awal: {formatIdr(account.openingBalance)}</p>
      </section>
    </div>
  );
}
