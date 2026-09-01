import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { buttonClass, cardClass, entityHeadingClass, narrowPageClass, pageDescriptionClass, pageHeadingCopyClass, pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
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
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <div className={pageHeadingRowClass}>
        <div className={pageHeadingCopyClass}>
          <h2 className={entityHeadingClass}>{account.name}</h2>
          <p className={pageDescriptionClass}>{account.status === "active" ? "Active account" : "Archived account"}</p>
        </div>
        <Link className={buttonClass("secondary")} href={`/accounts/${account.id}/edit`}>Edit</Link>
      </div>
      <section className={`${cardClass} grid gap-[.25rem]`}>
        <p className="m-0 text-muted text-[.78rem]">Current balance</p>
        <strong className={`wrap-anywhere text-[clamp(1.35rem,2.7vw,2rem)] ${negative ? "text-expense" : ""}`}>{formatIdr(account.balance)}</strong>
        {negative ? <p className="m-0 font-medium text-expense!">Account balance is negative.</p> : null}
        <p className="m-0 text-muted text-[.78rem]">Opening balance: {formatIdr(account.openingBalance)}</p>
      </section>
    </div>
  );
}
