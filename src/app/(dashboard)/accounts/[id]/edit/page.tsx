import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  AccountForm,
  getOwnedAccount,
  updateAccountAction,
} from "@/modules/accounts";

export const metadata = { title: "Edit akun" };

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
    <div className="page-stack narrow-page">
      <p className="page-description">{account.name}</p>
      <section className="card">
        <AccountForm action={updateAccountAction} initial={account} />
      </section>
    </div>
  );
}
