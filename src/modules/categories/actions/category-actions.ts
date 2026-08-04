"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/require-session";
import { categoryIdSchema, categorySchema } from "../schemas/category";
import { normalizeCategoryName } from "../services/normalize-category-name";

export type CategoryActionState = { success?: string; error?: string };

function optionalValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value ? value : null;
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code?: string }).code === "23505";
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
    await db.insert(categories).values({
      userId: user.id,
      name: parsed.data.name,
      normalizedName: normalizeCategoryName(parsed.data.name),
      type: parsed.data.type,
      icon: parsed.data.icon,
      color: parsed.data.color,
      isDefault: false,
    });
  } catch (error) {
    return { error: isUniqueViolation(error) ? "Kategori aktif dengan nama tersebut sudah ada." : "Kategori belum dapat dibuat." };
  }
  revalidatePath("/categories");
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
    await db
      .update(categories)
      .set({
        name: parsed.data.name,
        normalizedName: normalizeCategoryName(parsed.data.name),
        icon: parsed.data.icon,
        color: parsed.data.color,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id.data), eq(categories.userId, user.id)));
  } catch (error) {
    return { error: isUniqueViolation(error) ? "Kategori aktif dengan nama tersebut sudah ada." : "Kategori belum dapat diperbarui." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: "Kategori berhasil diperbarui." };
}

async function setCategoryStatus(formData: FormData, status: "active" | "archived") {
  const user = await requireSessionUser();
  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  try {
    await db
      .update(categories)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(categories.id, id.data), eq(categories.userId, user.id)));
  } catch {
    return;
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
}

export async function archiveCategoryAction(formData: FormData) {
  await setCategoryStatus(formData, "archived");
}

export async function restoreCategoryAction(formData: FormData) {
  await setCategoryStatus(formData, "active");
}
