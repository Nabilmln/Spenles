"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { hasPostgresErrorCode } from "@/db/errors";
import { categories } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/require-session";
import { categoryIdSchema, categorySchema } from "../schemas/category";
import {
  setOwnedCategoryStatus,
  updateOwnedCategory,
} from "../services/category-mutations";
import { normalizeCategoryName } from "../services/normalize-category-name";

export type CategoryActionState = { success?: string; error?: string };
export type CategoryStatusActionState = { error?: string };

function optionalValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value ? value : null;
}

export async function createCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireSessionUser();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    icon: optionalValue(formData, "icon"),
    color: optionalValue(formData, "color"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const rows = await db.insert(categories).values({
      userId: user.id,
      name: parsed.data.name,
      normalizedName: normalizeCategoryName(parsed.data.name),
      type: parsed.data.type,
      icon: parsed.data.icon,
      color: parsed.data.color,
      isDefault: false,
    }).returning({ id: categories.id });
    if (!rows[0]) return { error: "Kategori belum dapat dibuat." };
  } catch (error) {
    return { error: hasPostgresErrorCode(error, "23505") ? "Kategori aktif dengan nama tersebut sudah ada." : "Kategori belum dapat dibuat." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { success: "Kategori berhasil dibuat." };
}

export async function updateCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireSessionUser();
  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Kategori tidak ditemukan." };
  const existing = await db.query.categories.findFirst({
    where: and(eq(categories.id, id.data), eq(categories.userId, user.id)),
  });
  if (!existing) return { error: "Kategori tidak ditemukan." };
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: existing.type,
    icon: optionalValue(formData, "icon"),
    color: optionalValue(formData, "color"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const updated = await updateOwnedCategory(db, user.id, id.data, {
      name: parsed.data.name,
      normalizedName: normalizeCategoryName(parsed.data.name),
      icon: parsed.data.icon,
      color: parsed.data.color,
    });
    if (!updated) return { error: "Kategori tidak ditemukan." };
  } catch (error) {
    return { error: hasPostgresErrorCode(error, "23505") ? "Kategori aktif dengan nama tersebut sudah ada." : "Kategori belum dapat diperbarui." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { success: "Kategori berhasil diperbarui." };
}

async function setCategoryStatus(
  formData: FormData,
  status: "active" | "archived",
): Promise<CategoryStatusActionState> {
  const user = await requireSessionUser();
  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Kategori tidak ditemukan." };
  try {
    const result = await setOwnedCategoryStatus(db, user.id, id.data, status);
    if (!result.ok && result.reason === "duplicate") {
      return { error: "Kategori tidak dapat dipulihkan karena nama aktif yang sama sudah ada." };
    }
    if (!result.ok) return { error: "Kategori tidak ditemukan." };
  } catch {
    return { error: "Status kategori belum dapat diperbarui." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return {};
}

export async function archiveCategoryAction(
  _state: CategoryStatusActionState,
  formData: FormData,
) {
  return setCategoryStatus(formData, "archived");
}

export async function restoreCategoryAction(
  _state: CategoryStatusActionState,
  formData: FormData,
) {
  return setCategoryStatus(formData, "active");
}
