import { requireSessionUser } from "@/lib/auth/require-session";
import { CategoryForm, CategoryList, createCategoryAction, listCategories } from "@/modules/categories";

export default async function CategoriesPage() {
  const user = await requireSessionUser();
  const rows = await listCategories(user.id);
  return (
    <div className="page-stack">
      <div className="section-heading"><p className="eyebrow">Kategori</p><h1>Kelola kategori</h1><p>Kategori yang diarsipkan tetap tersimpan pada transaksi lama.</p></div>
      <div className="category-layout">
        <section className="card">
          <h2>Tambah kategori</h2>
          <CategoryForm action={createCategoryAction} />
        </section>
        <section>
          <CategoryList rows={rows} />
        </section>
      </div>
    </div>
  );
}
