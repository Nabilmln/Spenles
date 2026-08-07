"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
    <div className="category-manager">
      <div aria-label="Jenis kategori" className="category-tabs" role="tablist">
        <button
          aria-selected={tab === "expense"}
          className={tab === "expense" ? "category-tab category-tab-active" : "category-tab"}
          onClick={() => setTab("expense")}
          role="tab"
          type="button"
        >
          Pengeluaran
        </button>
        <button
          aria-selected={tab === "income"}
          className={tab === "income" ? "category-tab category-tab-active" : "category-tab"}
          onClick={() => setTab("income")}
          role="tab"
          type="button"
        >
          Pendapatan
        </button>
      </div>

      <div className="category-panel-heading">
        <div>
          <h2>{tab === "expense" ? "Kategori pengeluaran" : "Kategori pendapatan"}</h2>
          <p>Kategori yang diarsipkan tetap tersimpan pada transaksi lama.</p>
        </div>
        <button
          aria-label="Tambah Kategori"
          className="button button-primary category-add-button"
          onClick={openCreate}
          type="button"
        >
          <Plus aria-hidden="true" size={18} />
          Tambah Kategori
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="category-empty">
          <h2>{tab === "expense" ? "Belum ada kategori pengeluaran" : "Belum ada kategori pendapatan"}</h2>
          <p>Kategori yang kamu buat akan muncul di sini.</p>
        </div>
      ) : (
        <div className="category-list" role="list">
          {visible.map((item) => {
            const Icon = resolveCategoryIcon(item.id, item.name, item.icon);
            return (
              <div
                className="category-row"
                key={item.id}
                role="listitem"
              >
                <span
                  className={item.status === "archived" ? "category-row-icon archived" : "category-row-icon"}
                  data-color={item.color ?? undefined}
                >
                  <Icon aria-hidden="true" size={20} />
                </span>
                <div className="category-row-copy">
                  <strong>{item.name}</strong>
                  {item.status === "archived" ? <small>Diarsipkan</small> : null}
                </div>
                <button
                  aria-haspopup="menu"
                  aria-label={`Aksi untuk ${item.name}`}
                  aria-expanded={menuFor === item.id}
                  className="icon-button category-action-button"
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
    <div className="category-sheet-backdrop" onClick={onClose}>
      <div
        aria-labelledby="category-editor-title"
        aria-modal="true"
        className="category-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="category-sheet-header">
          <h2 id="category-editor-title">{isNew ? "Tambah kategori" : "Edit kategori"}</h2>
          <button
            aria-label="Tutup formulir kategori"
            className="icon-button"
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
    <div className="category-menu-backdrop" onClick={onClose}>
      <div
        aria-label="Menu aksi kategori"
        className="category-action-menu"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        ref={menuRef}
        role="menu"
        tabIndex={-1}
      >
        <strong className="category-menu-heading">{item.name}</strong>
        <button className="category-menu-item" onClick={onEdit} role="menuitem" type="button">
          <Pencil aria-hidden="true" size={18} /> Edit kategori
        </button>
        {item.status === "active" ? (
          <ArchiveButton categoryId={item.id} />
        ) : (
          <RestoreButton categoryId={item.id} />
        )}
        <button
          className="category-menu-item category-menu-danger"
          onClick={onDelete}
          role="menuitem"
          type="button"
        >
          <Trash2 aria-hidden="true" size={18} /> Hapus
        </button>
      </div>
    </div>
  );
}

function ArchiveButton({ categoryId }: { categoryId: string }) {
  const [state, formAction, pending] = useActionState(archiveCategoryAction, {});
  return (
    <form action={formAction} className="category-menu-form">
      <input name="id" type="hidden" value={categoryId} />
      {state.error ? <p className="form-message category-menu-error" role="alert">{state.error}</p> : null}
      <button className="category-menu-item" disabled={pending} role="menuitem" type="submit">
        <Archive aria-hidden="true" size={18} />
        {pending ? "Memproses..." : "Arsipkan"}
      </button>
    </form>
  );
}

function RestoreButton({ categoryId }: { categoryId: string }) {
  const [state, formAction, pending] = useActionState(restoreCategoryAction, {});
  return (
    <form action={formAction} className="category-menu-form">
      <input name="id" type="hidden" value={categoryId} />
      {state.error ? <p className="form-message category-menu-error" role="alert">{state.error}</p> : null}
      <button className="category-menu-item" disabled={pending} role="menuitem" type="submit">
        <ArchiveRestore aria-hidden="true" size={18} />
        {pending ? "Memproses..." : "Pulihkan"}
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
    <div className="category-sheet-backdrop" onClick={onClose}>
      <div
        aria-labelledby="category-delete-title"
        aria-modal="true"
        className="category-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="category-sheet-header">
          <h2 id="category-delete-title">Hapus kategori?</h2>
          <button
            aria-label="Tutup konfirmasi"
            className="icon-button"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <p>
          {deletable
            ? `Kategori "${item.name}" akan dihapus permanen dan tidak dapat dipulihkan. Tindakan ini hanya berlaku karena kategori belum dipakai transaksi, anggaran, atau aturan berulang.`
            : `Kategori "${item.name}" tidak dapat dihapus permanen. Arsipkan kategori untuk menyembunyikannya sambil tetap menyimpan riwayat transaksi.`}
        </p>
        {deletable ? (
          <DeleteButton categoryId={item.id} />
        ) : item.status === "archived" ? (
          <p className="muted">Kategori sudah terarsip.</p>
        ) : (
          <ArchiveButton categoryId={item.id} />
        )}
      </div>
    </div>
  );
}

function DeleteButton({ categoryId }: { categoryId: string }) {
  const [state, formAction, pending] = useActionState(deleteCategoryAction, {});
  return (
    <form action={formAction} className="category-confirm-form">
      <input name="id" type="hidden" value={categoryId} />
      {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
      {state.success ? <p className="success-message">{state.success}</p> : null}
      <button className="button button-danger" disabled={pending} type="submit">
        {pending ? "Menghapus..." : "Hapus permanen"}
      </button>
    </form>
  );
}