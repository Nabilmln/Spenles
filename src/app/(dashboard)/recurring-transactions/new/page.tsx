import { requireSessionUser } from "@/lib/auth/require-session";
import {
  createRecurringRuleAction,
  listRecurringOptions,
  RecurringRuleForm,
} from "@/modules/recurring-transactions";

export const metadata = { title: "Buat transaksi berulang" };

export default async function NewRecurringRulePage() {
  const user = await requireSessionUser();
  const options = await listRecurringOptions(user.id);
  return (
    <div className="page-stack narrow-page">
      <p className="page-description">Kejadian masa lalu tidak dibuat saat aturan disimpan.</p>
      <section className="card">
        <RecurringRuleForm
          action={createRecurringRuleAction}
          accounts={options.accounts}
          categories={options.categories}
        />
      </section>
    </div>
  );
}
