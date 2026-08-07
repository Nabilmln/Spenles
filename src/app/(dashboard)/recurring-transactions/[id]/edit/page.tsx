import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { formatJakartaDateTimeInput } from "@/lib/dates/jakarta";
import {
  getOwnedRecurringRule,
  listRecurringOptions,
  RecurringRuleForm,
  updateRecurringRuleAction,
} from "@/modules/recurring-transactions";

export const metadata = { title: "Edit transaksi berulang" };

export default async function EditRecurringRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser();
  const { id } = await params;
  const [rule, options] = await Promise.all([
    getOwnedRecurringRule(user.id, id),
    listRecurringOptions(user.id),
  ]);
  if (!rule || rule.status === "archived") notFound();
  const accounts = options.accounts.some((item) => item.id === rule.accountId)
    ? options.accounts
    : [{ id: rule.accountId, name: rule.accountName }, ...options.accounts];
  const categories = options.categories.some((item) => item.id === rule.categoryId)
    ? options.categories
    : [{ id: rule.categoryId, name: rule.categoryName, type: rule.type }, ...options.categories];
  return (
    <div className="page-stack narrow-page">
      <p className="page-description">Tanggal mulai tetap menjadi jangkar jadwal.</p>
      <section className="card">
        <RecurringRuleForm
          action={updateRecurringRuleAction}
          accounts={accounts}
          categories={categories}
          defaultStart={formatJakartaDateTimeInput(rule.startAt)}
          initial={rule}
        />
      </section>
    </div>
  );
}
