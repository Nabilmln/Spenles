"use client";

import { useEffect, useRef, useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  archiveCategoryAction,
  deleteCategoryAction,
  restoreCategoryAction,
  updateCategoryAction,
} from "../actions/category-actions";
import { resolveCategoryIcon } from "../constants/category-icons";
import { buttonClass, iconButtonClass } from "@/components/ui/styles";
import { cn } from "@/lib/utils";
import { CategoryForm } from "./category-form";

const sheetClass =
  "w-[min(34rem,100%)] max-h-[88vh] overflow-y-auto rounded-[1.25rem_1.25rem_1.1rem_1.1rem] border border-border bg-surface p-5 shadow-card [&_p]:text-muted [&_p]:text-[.88rem] [&_p]:leading-[1.5]";

const sheetBackdropClass =
  "fixed inset-0 z-[60] flex items-end justify-center bg-[rgb(15_17_21/55%)] p-4 min-[861px]:items-center";

const menuBackdropClass =
  "fixed inset-0 z-[55] flex items-center justify-center bg-[rgb(15_17_21/55%)] p-4";

const menuItemClass =
  "flex w-full cursor-pointer items-center gap-[.6rem] rounded-[.65rem] border-0 bg-transparent p-[.7rem_.75rem] text-left text-[.92rem] font-medium text-foreground hover:bg-surface-subtle [&_svg]:shrink-0 [&_svg]:text-primary-600";

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
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [confirming, setConfirming] = useState<CategoryItem | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visible = categories.filter((item) => item.type === tab);
  const menuItem = menuFor ? categories.find((item) => item.id === menuFor) ?? null : null;

  useEffect(() => {
    if (menuItem) menuRef.current?.focus();
  }, [menuItem]);

  function openCreate() {
    setEditing(emptyCategory(tab));
  }

  return (
    <div className="grid gap-4">
      <div aria-label="Category type" className="grid grid-cols-[1fr_1fr] gap-[.35rem] rounded-[1rem] border border-border bg-surface-subtle p-1" role="tablist">
        <button
          aria-selected={tab === "expense"}
          className={cn(
            "min-h-[2.7rem] cursor-pointer rounded-[.75rem] border-0 bg-transparent p-[.5rem_.7rem] font-medium text-muted",
            tab === "expense" && "bg-surface text-primary-700 shadow-card",
          )}
          onClick={() => setTab("expense")}
          role="tab"
          type="button"
        >
          Expense
        </button>
        <button
          aria-selected={tab === "income"}
          className={cn(
            "min-h-[2.7rem] cursor-pointer rounded-[.75rem] border-0 bg-transparent p-[.5rem_.7rem] font-medium text-muted",
            tab === "income" && "bg-surface text-primary-700 shadow-card",
          )}
          onClick={() => setTab("income")}
          role="tab"
          type="button"
        >
          Income
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 max-[560px]:flex-col">
        <div>
          <h2 className="m-0 text-[1.08rem] tracking-[-.02em]">{tab === "expense" ? "Expense categories" : "Income categories"}</h2>
          <p className="mt-[.2rem] text-[.82rem] text-muted">Archived categories remain attached to past transactions.</p>
        </div>
        <button
          aria-label="Add Category"
          className={`${buttonClass("primary")} min-w-0 max-[560px]:w-full`}
          onClick={openCreate}
          type="button"
        >
          <Plus aria-hidden="true" size={18} />
          Add Category
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="grid gap-[.35rem] rounded-[1rem] border border-dashed border-border bg-surface-subtle p-[clamp(1.5rem,6vw,2.5rem)]">
          <h2 className="m-0 text-base">{tab === "expense" ? "No expense categories yet" : "No income categories yet"}</h2>
          <p className="m-0 text-[.84rem] text-muted">Categories you create will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-[.6rem]" role="list">
          {visible.map((item) => {
            const Icon = resolveCategoryIcon(item.id, item.name, item.icon);
            return (
              <div
                className="flex min-w-0 items-center gap-[.8rem] rounded-[1rem] border border-border bg-surface p-[.8rem_1rem] shadow-card"
                key={item.id}
                role="listitem"
              >
                <span
                  className={cn(
                    "grid h-[2.6rem] w-[2.6rem] shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600",
                    item.color === "green" && "bg-[color-mix(in_srgb,var(--income)_10%,transparent)] text-income",
                    item.status === "archived" && "opacity-55",
                  )}
                  data-color={item.color ?? undefined}
                >
                  <Icon aria-hidden="true" size={20} />
                </span>
                <div className="grid min-w-0 flex-auto gap-[.1rem]">
                  <strong className="truncate">{item.name}</strong>
                  {item.status === "archived" ? <small className="text-[.76rem] font-medium text-muted">Archived</small> : null}
                </div>
                <button
                  aria-haspopup="menu"
                  aria-label={`Actions for ${item.name}`}
                  aria-expanded={menuFor === item.id}
                  className={cn(iconButtonClass, "size-10 shrink-0")}
                  onClick={() => setMenuFor((current) => (current === item.id ? null : item.id))}
                  type="button"
                >
                  <MoreHorizontal aria-hidden="true" size={19} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {editing ? (
        <CategorySheet
          item={editing}
          onClose={() => setEditing(null)}
          isNew={!editing.id}
          defaultType={tab}
        />
      ) : null}
      {menuItem ? (
        <CategoryActionMenu
          item={menuItem}
          menuRef={menuRef}
          onClose={() => setMenuFor(null)}
          onEdit={() => {
            setEditing(menuItem);
            setMenuFor(null);
          }}
          onDelete={() => {
            setConfirming(menuItem);
            setMenuFor(null);
          }}
        />
      ) : null}
      {confirming ? (
        <CategoryDeleteSheet
          item={confirming}
          deletable={deletableIds.has(confirming.id) && !confirming.isDefault}
          onClose={() => setConfirming(null)}
        />
      ) : null}
    </div>
  );
}

function CategorySheet({
  item,
  isNew,
  defaultType,
  onClose,
}: {
  item: CategoryItem;
  isNew: boolean;
  defaultType: "income" | "expense";
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  return (
    <div className={sheetBackdropClass} onClick={onClose}>
      <div
        aria-labelledby="category-editor-title"
        aria-modal="true"
        className={sheetClass}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="m-0 text-[1.05rem] tracking-[-.02em]" id="category-editor-title">{isNew ? "Add category" : "Edit category"}</h2>
          <button
            aria-label="Close category form"
            className={iconButtonClass}
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <CategoryForm
          action={updateCategoryAction}
          formId={isNew ? "category-create-form" : `category-edit-${item.id}`}
          initial={
            isNew
              ? { id: "", name: "", type: defaultType, icon: null, color: null }
              : { id: item.id, name: item.name, type: item.type, icon: item.icon, color: item.color }
          }
        />
      </div>
    </div>
  );
}

function CategoryActionMenu({
  item,
  menuRef,
  onClose,
  onEdit,
  onDelete,
}: {
  item: CategoryItem;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={menuBackdropClass} onClick={onClose}>
      <div
        aria-label="Category actions menu"
        className="w-[min(19rem,100%)] rounded-[1rem] border border-border bg-surface p-[.4rem] shadow-card min-[861px]:absolute"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        ref={menuRef}
        role="menu"
        tabIndex={-1}
      >
        <strong className="block p-[.55rem_.7rem_.45rem] text-[.76rem] text-muted">{item.name}</strong>
        <button className={menuItemClass} onClick={onEdit} role="menuitem" type="button">
          <Pencil aria-hidden="true" size={18} /> Edit category
        </button>
        {item.status === "active" ? (
          <ArchiveButton categoryId={item.id} />
        ) : (
          <RestoreButton categoryId={item.id} />
        )}
        <button
          className={cn(menuItemClass, "text-expense [&_svg]:text-expense")}
          onClick={onDelete}
          role="menuitem"
          type="button"
        >
          <Trash2 aria-hidden="true" size={18} /> Delete
        </button>
      </div>
    </div>
  );
}

function ArchiveButton({ categoryId }: { categoryId: string }) {
  const [, formAction, pending] = useToastActionState(archiveCategoryAction, {});
  return (
    <form action={formAction} className="m-0">
      <input name="id" type="hidden" value={categoryId} />
      <button className={menuItemClass} disabled={pending} role="menuitem" type="submit">
        <Archive aria-hidden="true" size={18} />
        {pending ? "Processing..." : "Archive"}
      </button>
    </form>
  );
}

function RestoreButton({ categoryId }: { categoryId: string }) {
  const [, formAction, pending] = useToastActionState(restoreCategoryAction, {});
  return (
    <form action={formAction} className="m-0">
      <input name="id" type="hidden" value={categoryId} />
      <button className={menuItemClass} disabled={pending} role="menuitem" type="submit">
        <ArchiveRestore aria-hidden="true" size={18} />
        {pending ? "Processing..." : "Restore"}
      </button>
    </form>
  );
}

function CategoryDeleteSheet({
  item,
  deletable,
  onClose,
}: {
  item: CategoryItem;
  deletable: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  return (
    <div className={sheetBackdropClass} onClick={onClose}>
      <div
        aria-labelledby="category-delete-title"
        aria-modal="true"
        className={sheetClass}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="m-0 text-[1.05rem] tracking-[-.02em]" id="category-delete-title">Delete category?</h2>
          <button
            aria-label="Close confirmation"
            className={iconButtonClass}
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <p>
          {deletable
            ? `Category "${item.name}" will be permanently deleted and cannot be restored. This action only applies because the category is not yet used by transactions, budgets, or recurring rules.`
            : `Category "${item.name}" cannot be permanently deleted. Archive the category to hide it while keeping its transaction history.`}
        </p>
        {deletable ? (
          <DeleteButton categoryId={item.id} />
        ) : item.status === "archived" ? (
          <p className="text-muted">Category is already archived.</p>
        ) : (
          <ArchiveButton categoryId={item.id} />
        )}
      </div>
    </div>
  );
}

function DeleteButton({ categoryId }: { categoryId: string }) {
  const [, formAction, pending] = useToastActionState(deleteCategoryAction, {});
  return (
    <form action={formAction} className="mt-4 grid gap-[.6rem]">
      <input name="id" type="hidden" value={categoryId} />
      <button className={`${buttonClass("danger")} w-full justify-center`} disabled={pending} type="submit">
        {pending ? "Deleting..." : "Delete permanently"}
      </button>
    </form>
  );
}
