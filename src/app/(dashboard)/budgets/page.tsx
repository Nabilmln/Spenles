import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
import {
  BudgetSection,
  listActiveExpenseCategoryOptions,
  listOwnedBudgets,
} from "@/modules/budgets";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const user = await requireSessionUser();
  const [rows, categories] = await Promise.all([
    listOwnedBudgets(user.id),
    listActiveExpenseCategoryOptions(user.id),
  ]);
  return (
    <div className={pageStackClass}>
      <BudgetSection rows={rows} categories={categories} />
    </div>
  );
}