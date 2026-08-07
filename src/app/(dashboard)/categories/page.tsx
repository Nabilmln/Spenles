import { requireSessionUser } from "@/lib/auth/require-session";
import {
  CategoryManager,
  listCategories,
  listDeletableCategoryIds,
} from "@/modules/categories";

export default async function CategoriesPage() {
  const user = await requireSessionUser();
  const [rows, deletableIds] = await Promise.all([
    listCategories(user.id),
    listDeletableCategoryIds(user.id),
  ]);
  const categories = rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    status: row.status,
    isDefault: row.isDefault,
  }));
  return (
    <div className="page-stack categories-page">
      <div className="section-heading">
        <p className="eyebrow">Kategori</p>
        <h1>Kelola kategori</h1>
        <p>Kategori diarsipkan tetap tersimpan pada transaksi lama.</p>
      </div>
      <CategoryManager categories={categories} deletableIds={deletableIds} />
    </div>
  );
}