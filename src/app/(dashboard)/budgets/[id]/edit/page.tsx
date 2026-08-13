import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass, narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import {
  BudgetForm,
  getOwnedBudget,
  listActiveExpenseCategoryOptions,
  updateBudgetAction,
} from "@/modules/budgets";

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSessionUser();
  const { id } = await params;
  const [budget, categories] = await Promise.all([
    getOwnedBudget(user.id, id),
    listActiveExpenseCategoryOptions(user.id),
  ]);
  if (!budget || budget.recordStatus !== "active") notFound();
  const options = categories.some((category) => category.id === budget.categoryId)
    ? categories
    : [{ id: budget.categoryId, name: budget.categoryName }, ...categories];
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>{budget.categoryName}</p>
      <section className={cardClass}>
        <BudgetForm action={updateBudgetAction} categories={options} initial={budget} />
      </section>
    </div>
  );
}
