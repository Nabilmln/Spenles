import { SectionHeading } from "@/components/layout/section-heading";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  BudgetForm,
  createBudgetAction,
  listActiveExpenseCategoryOptions,
} from "@/modules/budgets";

export const metadata = { title: "Buat anggaran" };

export default async function NewBudgetPage() {
  const user = await requireSessionUser();
  const categories = await listActiveExpenseCategoryOptions(user.id);
  return (
    <div className="page-stack narrow-page">
      <SectionHeading eyebrow="Anggaran" title="Buat anggaran" description="Satu anggaran aktif per kategori dan bulan." />
      <section className="card">
        {categories.length > 0 ? (
          <BudgetForm action={createBudgetAction} categories={categories} />
        ) : (
          <p>Tidak ada kategori pengeluaran aktif.</p>
        )}
      </section>
    </div>
  );
}
