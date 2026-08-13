import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass, narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import {
  AccountForm,
  getOwnedAccount,
  updateAccountAction,
} from "@/modules/accounts";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser();
  const { id } = await params;
  const account = await getOwnedAccount(user.id, id);
  if (!account) notFound();
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>{account.name}</p>
      <section className={cardClass}>
        <AccountForm action={updateAccountAction} initial={account} />
      </section>
    </div>
  );
}
