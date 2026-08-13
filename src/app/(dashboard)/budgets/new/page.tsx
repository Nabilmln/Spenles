import { requireSessionUser } from "@/lib/auth/require-session";
import { cardClass, narrowPageClass, pageDescriptionClass, pageStackClass } from "@/components/ui/styles";
import {
  BudgetForm,
  createBudgetAction,
  listActiveExpenseCategoryOptions,
} from "@/modules/budgets";

export default async function NewBudgetPage() {
  const user = await requireSessionUser();
  const categories = await listActiveExpenseCategoryOptions(user.id);
  return (
    <div className={`${pageStackClass} ${narrowPageClass}`}>
      <p className={pageDescriptionClass}>Satu anggaran aktif per kategori dan bulan.</p>
      <section className={cardClass}>
        {categories.length > 0 ? (
          <BudgetForm action={createBudgetAction} categories={categories} />
        ) : (
          <p>Tidak ada kategori pengeluaran aktif.</p>
        )}
      </section>
    </div>
  );
}
