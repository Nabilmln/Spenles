"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { hasPostgresErrorCode } from "@/db/errors";
import { categories } from "@/db/schema";
import { requireSessionUser } from "@/lib/auth/require-session";
import { categoryIdSchema, categorySchema } from "../schemas/category";
import {
  deleteOwnedCategory,
  isOwnedCategoryReferenced,
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
    if (!rows[0]) return { error: "Category could not be created." };
  } catch (error) {
    return { error: hasPostgresErrorCode(error, "23505") ? "An active category with that name already exists." : "Category could not be created." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/recurring-transactions");
  revalidatePath("/dashboard");
  return { success: "Category created successfully." };
}

export async function updateCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireSessionUser();
  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Category not found." };
  const existing = await db.query.categories.findFirst({
    where: and(eq(categories.id, id.data), eq(categories.userId, user.id)),
  });
  if (!existing) return { error: "Category not found." };
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
    if (!updated) return { error: "Category not found." };
  } catch (error) {
    return { error: hasPostgresErrorCode(error, "23505") ? "An active category with that name already exists." : "Category could not be updated." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/recurring-transactions");
  revalidatePath("/dashboard");
  return { success: "Category updated successfully." };
}

async function setCategoryStatus(
  formData: FormData,
  status: "active" | "archived",
): Promise<CategoryStatusActionState> {
  const user = await requireSessionUser();
  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Category not found." };
  try {
    const result = await setOwnedCategoryStatus(db, user.id, id.data, status);
    if (!result.ok && result.reason === "duplicate") {
      return { error: "Category cannot be restored because an active category with that name already exists." };
    }
    if (!result.ok) return { error: "Category not found." };
  } catch {
    return { error: "Category status could not be updated." };
  }
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/recurring-transactions");
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

export async function deleteCategoryAction(
  _state: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireSessionUser();
  const id = categoryIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Category not found." };
  const referenced = await isOwnedCategoryReferenced(db, user.id, id.data);
  if (referenced) {
    return {
      error: "Category cannot be deleted because it is still used by transactions, budgets, or recurring rules. Archive it instead.",
    };
  }
  const deleted = await deleteOwnedCategory(db, user.id, id.data);
  if (!deleted) return { error: "Category not found." };
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/recurring-transactions");
  revalidatePath("/dashboard");
  return { success: "Category deleted successfully." };
}
