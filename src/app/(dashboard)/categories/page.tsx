import { requireSessionUser } from "@/lib/auth/require-session";
import { pageStackClass } from "@/components/ui/styles";
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
    <div className={pageStackClass}>
      <CategoryManager categories={categories} deletableIds={deletableIds} />
    </div>
  );
}