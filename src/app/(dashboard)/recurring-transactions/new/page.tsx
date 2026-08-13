import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass, narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import {
  createRecurringRuleAction,
  listRecurringOptions,
  RecurringRuleForm,
} from "@/modules/recurring-transactions";

export default async function NewRecurringRulePage() {
  const user = await requireSessionUser();
  const options = await listRecurringOptions(user.id);
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>Kejadian masa lalu tidak dibuat saat aturan disimpan.</p>
      <section className={cardClass}>
        <RecurringRuleForm
          action={createRecurringRuleAction}
          accounts={options.accounts}
          categories={options.categories}
        />
      </section>
    </div>
  );
}
