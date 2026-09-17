"use client";

import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useToastActionState } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  archiveCategoryAction,
  restoreCategoryAction,
  type CategoryStatusActionState,
} from "../actions/category-actions";

const actionRowClass =
  "flex w-full min-h-[3rem] cursor-pointer items-center gap-[.75rem] rounded-[.8rem] border border-border bg-surface-subtle px-[.9rem] text-left text-[.9rem] font-medium transition-colors";

export function CategoryActionSheet({
  item,
  onClose,
  onEdit,
  onDelete,
}: {
  item: {
    id: string;
    name: string;
    status: "active" | "archived";
  } | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <BottomSheet
      open={item !== null}
      onClose={onClose}
      title="Category Actions"
      ariaLabel="Category actions"
      zIndex="z-[85]"
    >
      <div className="mb-6 grid gap-[.6rem]">
        <button type="button" className={actionRowClass} onClick={onEdit}>
          <Pencil size={18} aria-hidden="true" className="shrink-0 text-primary-600" />
          <span className="block">Edit category</span>
        </button>
        {item?.status === "active" ? (
          <CategoryArchiveRow categoryId={item.id} />
        ) : item?.status === "archived" ? (
          <CategoryRestoreRow categoryId={item.id} />
        ) : null}
        <button
          type="button"
          className={cn(actionRowClass, "text-expense [&_svg]:text-expense")}
          onClick={onDelete}
        >
          <Trash2 size={18} aria-hidden="true" className="shrink-0" />
          <span className="block">Delete</span>
        </button>
      </div>
    </BottomSheet>
  );
}

function CategoryArchiveRow({ categoryId }: { categoryId: string }) {
  const [, formAction, pending] = useToastActionState<
    CategoryStatusActionState,
    FormData
  >(archiveCategoryAction, {});
  return (
    <form action={formAction} className="m-0">
      <input name="id" type="hidden" value={categoryId} />
      <button type="submit" disabled={pending} className={actionRowClass}>
        <Archive
          size={18}
          aria-hidden="true"
          className="shrink-0 text-primary-600"
        />
        <span className="block">{pending ? "Archiving..." : "Archive"}</span>
      </button>
    </form>
  );
}

function CategoryRestoreRow({ categoryId }: { categoryId: string }) {
  const [, formAction, pending] = useToastActionState<
    CategoryStatusActionState,
    FormData
  >(restoreCategoryAction, {});
  return (
    <form action={formAction} className="m-0">
      <input name="id" type="hidden" value={categoryId} />
      <button type="submit" disabled={pending} className={actionRowClass}>
        <ArchiveRestore
          size={18}
          aria-hidden="true"
          className="shrink-0 text-primary-600"
        />
        <span className="block">{pending ? "Restoring..." : "Restore"}</span>
      </button>
    </form>
  );
}
