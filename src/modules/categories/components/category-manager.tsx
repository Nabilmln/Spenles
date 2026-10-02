"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import { useToastActionState } from "@/components/ui/toast";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { buttonClass, iconButtonClass, segmentedOptionClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import {
  archiveCategoryAction,
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryStatusActionState,
} from "../actions/category-actions";
import { resolveCategoryIcon } from "../constants/category-icons";
import { CategoryActionSheet } from "./category-action-sheet";
import { CategoryForm } from "./category-form";

type CategoryItem = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
  status: "active" | "archived";
  isDefault: boolean;
};

function emptyCategory(type: "income" | "expense"): CategoryItem {
  return {
    id: "",
    name: "",
    type,
    icon: null,
    color: null,
    status: "active",
    isDefault: false,
  };
}

export function CategoryManager({
  categories,
  deletableIds,
}: {
  categories: CategoryItem[];
  deletableIds: Set<string>;
}) {
  const [tab, setTab] = useState<"income" | "expense">("expense");
  const [actionFor, setActionFor] = useState<CategoryItem | null>(null);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [confirming, setConfirming] = useState<CategoryItem | null>(null);

  const visible = categories.filter((item) => item.type === tab);
  const actionItem = actionFor
    ? categories.find((item) => item.id === actionFor.id) ?? actionFor
    : null;

  function openCreate() {
    setEditing(emptyCategory(tab));
  }

  return (
    <div className="grid gap-[1.1rem]">
      <div
        aria-label="Category type"
        className="grid grid-cols-[1fr_1fr] gap-[.35rem] rounded-full border border-border bg-surface-subtle p-1"
        role="tablist"
      >
        <button
          aria-selected={tab === "expense"}
          className={segmentedOptionClass(tab === "expense", "min-h-[2.7rem]")}
          onClick={() => setTab("expense")}
          role="tab"
          type="button"
        >
          Expense
        </button>
        <button
          aria-selected={tab === "income"}
          className={segmentedOptionClass(tab === "income", "min-h-[2.7rem]")}
          onClick={() => setTab("income")}
          role="tab"
          type="button"
        >
          Income
        </button>
      </div>

<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-[560px]:grid-cols-1">
        <div aria-hidden="true" />
        <h2 className="m-0 text-center text-[1.08rem] tracking-[-.02em]">
          {tab === "expense" ? "Expense categories" : "Income categories"}
        </h2>
        <button
          aria-label="Add Category"
          className={`${buttonClass("primary")} justify-self-end min-w-0 max-[560px]:w-full`}
          onClick={openCreate}
          type="button"
        >
          <Plus aria-hidden="true" size={18} />
          Add Category
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="grid gap-[.35rem] rounded-[1.25rem] border border-dashed border-border bg-surface-subtle p-[clamp(1.5rem,6vw,2.5rem)]">
          <h2 className="m-0 text-base">
            {tab === "expense"
              ? "No expense categories yet"
              : "No income categories yet"}
          </h2>
          <p className="m-0 text-[.84rem] text-muted">
            Categories you create will show up here.
          </p>
        </div>
      ) : (
        <div
          className="divide-y divide-border overflow-hidden rounded-[1.25rem] border border-border bg-surface shadow-card"
          role="list"
        >
          {visible.map((item) => {
            const Icon = resolveCategoryIcon(item.id, item.name, item.icon);
            return (
              <div
                className="flex min-w-0 items-center gap-[.65rem] p-[.6rem_.8rem]"
                key={item.id}
                role="listitem"
              >
                <span
                  className={cn(
                    "grid size-[2.2rem] shrink-0 place-items-center rounded-full bg-primary-50 text-foreground",
                    item.status === "archived" && "opacity-55",
                  )}
                >
                  <Icon aria-hidden="true" size={18} />
                </span>
                <div className="grid min-w-0 flex-auto gap-0">
                  <strong className="truncate text-[.9rem]">{item.name}</strong>
                  {item.status === "archived" ? (
                    <small className="text-[.75rem] font-medium text-muted">
                      Archived
                    </small>
                  ) : null}
                </div>
                <button
                  aria-haspopup="dialog"
                  aria-label={`Actions for ${item.name}`}
                  aria-expanded={actionFor?.id === item.id}
                  className={cn(iconButtonClass, "size-9")}
                  onClick={() =>
                    setActionFor((current) =>
                      current?.id === item.id ? null : item,
                    )
                  }
                  type="button"
                >
                  <MoreHorizontal aria-hidden="true" size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <CategoryEditorSheet
        item={editing}
        onClose={() => setEditing(null)}
        defaultType={tab}
      />

      <CategoryActionSheet
        item={actionItem}
        onClose={() => setActionFor(null)}
        onEdit={() => {
          setEditing(actionItem);
          setActionFor(null);
        }}
        onDelete={() => {
          setConfirming(actionItem);
          setActionFor(null);
        }}
      />

      <CategoryDeleteSheet
        item={confirming}
        deletable={
          confirming
            ? deletableIds.has(confirming.id) && !confirming.isDefault
            : false
        }
        onClose={() => setConfirming(null)}
      />
    </div>
  );
}

function CategoryEditorSheet({
  item,
  defaultType,
  onClose,
}: {
  item: CategoryItem | null;
  defaultType: "income" | "expense";
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={item !== null}
      onClose={onClose}
      title={item?.id ? "Edit category" : "Add category"}
      ariaLabel={item?.id ? "Edit category" : "Add category"}
    >
      {item ? (
        <CategoryForm
          action={item.id ? updateCategoryAction : createCategoryAction}
          formId={
            item.id ? `category-edit-${item.id}` : "category-create-form"
          }
          onClose={onClose}
          initial={
            item.id
              ? {
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  icon: item.icon,
                }
              : { id: "", name: "", type: defaultType, icon: null }
          }
        />
      ) : null}
    </BottomSheet>
  );
}

function CategoryDeleteSheet({
  item,
  deletable,
  onClose,
}: {
  item: CategoryItem | null;
  deletable: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={item !== null}
      onClose={onClose}
      title="Delete category?"
      ariaLabel="Delete category?"
      zIndex="z-[85]"
    >
      {item ? (
        <>
          <p className="mb-4 text-[.85rem] leading-[1.5] text-muted">
            {deletable
              ? `Category "${item.name}" will be permanently deleted and cannot be restored. This action only applies because the category is not yet used by transactions or budgets.`
              : `Category "${item.name}" cannot be permanently deleted. Archive the category to hide it while keeping its transaction history.`}
          </p>
          {deletable ? (
            <DeleteButton categoryId={item.id} onClose={onClose} />
          ) : item.status === "archived" ? (
            <p className="text-[.82rem] text-muted">
              Category is already archived.
            </p>
          ) : (
            <CategoryDeleteArchiveButton categoryId={item.id} onClose={onClose} />
          )}
        </>
      ) : null}
    </BottomSheet>
  );
}

function CategoryDeleteArchiveButton({
  categoryId,
  onClose,
}: {
  categoryId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [, formAction, pending] = useToastActionState<
    CategoryStatusActionState,
    FormData
  >(archiveCategoryAction, {}, undefined, () => {
    onClose();
    router.refresh();
  });
  return (
    <form action={formAction} className="mt-2 grid gap-[.6rem]">
      <input name="id" type="hidden" value={categoryId} />
      <button
        className={`${buttonClass("primary")} w-full justify-center`}
        disabled={pending}
        type="submit"
      >
        {pending ? "Archiving..." : "Archive instead"}
      </button>
    </form>
  );
}

function DeleteButton({ categoryId, onClose }: { categoryId: string; onClose: () => void }) {
  const router = useRouter();
  const [, formAction, pending] = useToastActionState(deleteCategoryAction, {}, undefined, () => {
    onClose();
    router.refresh();
  });
  return (
    <form action={formAction} className="mt-4 grid gap-[.6rem]">
      <input name="id" type="hidden" value={categoryId} />
      <button
        className={`${buttonClass("danger")} w-full justify-center`}
        disabled={pending}
        type="submit"
      >
        {pending ? "Deleting..." : "Delete permanently"}
      </button>
    </form>
  );
}
