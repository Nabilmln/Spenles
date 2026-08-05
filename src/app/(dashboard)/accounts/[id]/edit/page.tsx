import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/layout/section-heading";
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
      <SectionHeading eyebrow="Akun" title="Edit akun" description={account.name} />
      <section className="card">
        <AccountForm action={updateAccountAction} initial={account} />
      </section>
    </div>
  );
}
