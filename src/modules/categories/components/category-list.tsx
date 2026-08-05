import { archiveCategoryAction, restoreCategoryAction, updateCategoryAction } from "../actions/category-actions";
import { CategoryForm } from "./category-form";
import { CategoryStatusForm } from "./category-status-form";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
  status: "active" | "archived";
  isDefault: boolean;
};

export function CategoryList({ rows }: { rows: Category[] }) {
  return (
    <div className="category-list">
      {rows.map((category) => (
        <article className="card category-row" key={category.id}>
          <div>
            <strong>{category.name}</strong>
            <p>{category.type === "expense" ? "Pengeluaran" : "Pemasukan"} · {category.status === "active" ? "Aktif" : "Diarsipkan"}{category.isDefault ? " · Bawaan" : ""}</p>
          </div>
          <div className="category-actions">
            {category.status === "active" ? (
              <>
                <details>
                  <summary className="button button-secondary">Edit</summary>
                  <div className="category-editor">
                    <CategoryForm action={updateCategoryAction} initial={category} />
                  </div>
                </details>
                <CategoryStatusForm
                  action={archiveCategoryAction}
                  categoryId={category.id}
                  label="Arsipkan"
                />
              </>
            ) : (
              <CategoryStatusForm
                action={restoreCategoryAction}
                categoryId={category.id}
                label="Pulihkan"
              />
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
