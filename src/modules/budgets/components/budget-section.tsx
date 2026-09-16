"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHeadingRowClass, pageStackClass } from "@/components/ui/styles";
import { BudgetList } from "./budget-list";
import { BudgetSheet } from "./budget-sheet";
import type { BudgetCategoryOption } from "./budget-picker-sheets";
import type { BudgetListRow } from "../queries/budgets";

export function BudgetSection({
  rows,
  categories,
}: {
  rows: BudgetListRow[];
  categories: BudgetCategoryOption[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetListRow | null>(null);

  const editCategories =
    editing && !categories.some((category) => category.id === editing.categoryId)
      ? [
          {
            id: editing.categoryId,
            name: editing.categoryName,
            icon: editing.categoryIcon,
          },
          ...categories,
        ]
      : categories;

  return (
    <div className={pageStackClass}>
      <div className={pageHeadingRowClass}>
        <Button
          type="button"
          className="gap-[.4rem]"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={16} aria-hidden="true" />
          Create budget
        </Button>
      </div>

      <BudgetList rows={rows} onEdit={setEditing} />

      <BudgetSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        initial={null}
      />
      <BudgetSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        categories={editCategories}
        initial={editing}
      />
    </div>
  );
}