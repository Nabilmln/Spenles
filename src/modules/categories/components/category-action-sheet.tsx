"use client";

import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { actionSheetRowClass } from "@/components/ui/styles";
import { useToastActionState } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  archiveCategoryAction,
  restoreCategoryAction,
  type CategoryStatusActionState,
} from "../actions/category-actions";

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
        <button type="button" className={actionSheetRowClass} onClick={onEdit}>
          <Pencil size={18} aria-hidden="true" className="shrink-0 text-primary-600" />
          <span className="block">Edit category</span>
        </button>
        {item?.status === "active" ? (
          <CategoryArchiveRow categoryId={item.id} onClose={onClose} />
        ) : item?.status === "archived" ? (
          <CategoryRestoreRow categoryId={item.id} onClose={onClose} />
        ) : null}
        <button
          type="button"
          className={cn(actionSheetRowClass, "text-expense [&_svg]:text-expense")}
          onClick={onDelete}
        >
          <Trash2 size={18} aria-hidden="true" className="shrink-0" />
          <span className="block">Delete</span>
        </button>
      </div>
    </BottomSheet>
  );
}

function CategoryArchiveRow({ categoryId, onClose }: { categoryId: string; onClose: () => void }) {
  const router = useRouter();
  const [, formAction, pending] = useToastActionState<
    CategoryStatusActionState,
    FormData
  >(archiveCategoryAction, {}, undefined, () => {
    onClose();
    router.refresh();
  });
  return (
    <form action={formAction} className="m-0">
      <input name="id" type="hidden" value={categoryId} />
      <button type="submit" disabled={pending} className={actionSheetRowClass}>
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

function CategoryRestoreRow({ categoryId, onClose }: { categoryId: string; onClose: () => void }) {
  const router = useRouter();
  const [, formAction, pending] = useToastActionState<
    CategoryStatusActionState,
    FormData
  >(restoreCategoryAction, {}, undefined, () => {
    onClose();
    router.refresh();
  });
  return (
    <form action={formAction} className="m-0">
      <input name="id" type="hidden" value={categoryId} />
      <button type="submit" disabled={pending} className={actionSheetRowClass}>
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
