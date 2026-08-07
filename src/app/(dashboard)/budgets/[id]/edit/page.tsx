import { notFound } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  BudgetForm,
  getOwnedBudget,
  listActiveExpenseCategoryOptions,
  updateBudgetAction,
} from "@/modules/budgets";

export const metadata = { title: "Edit anggaran" };

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
    <div className="page-stack narrow-page">
      <p className="page-description">{budget.categoryName}</p>
      <section className="card">
        <BudgetForm action={updateBudgetAction} categories={options} initial={budget} />
      </section>
    </div>
  );
}
