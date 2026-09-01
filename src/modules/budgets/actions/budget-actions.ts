"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import { budgetMonthToDate } from "@/lib/dates/jakarta-month";
import { budgetIdSchema, budgetSchema } from "../schemas/budget";
import {
  createOwnedBudget,
  setOwnedBudgetStatus,
  updateOwnedBudget,
} from "../services/budget-mutations";

export type BudgetActionState = { error?: string };

function parse(formData: FormData) {
  return budgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    month: formData.get("month"),
    amount: formData.get("amount"),
    warningThresholdBps: formData.get("warningThresholdBps"),
  });
}

function invalidateBudgets() {
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function createBudgetAction(
  _state: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const user = await requireSessionUser();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const budgetMonth = budgetMonthToDate(parsed.data.month)!;
  try {
    const result = await createOwnedBudget(db, user.id, {
      categoryId: parsed.data.categoryId,
      budgetMonth,
      amount: BigInt(parsed.data.amount),
      warningThresholdBps: parsed.data.warningThresholdBps,
    });
    if (!result.ok) {
      return {
        error:
          result.reason === "duplicate"
            ? "An active budget for that category and month already exists."
            : "Expense category is not available.",
      };
    }
  } catch {
    return { error: "Budget could not be created." };
  }
  invalidateBudgets();
  redirect("/budgets");
}

export async function updateBudgetAction(
  _state: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const user = await requireSessionUser();
  const id = budgetIdSchema.safeParse(formData.get("id"));
  const parsed = parse(formData);
  if (!id.success || !parsed.success) {
    return {
      error: parsed.success ? "Budget not found." : parsed.error.issues[0]?.message,
    };
  }
  try {
    const updated = await updateOwnedBudget(db, user.id, id.data, {
      amount: BigInt(parsed.data.amount),
      warningThresholdBps: parsed.data.warningThresholdBps,
    });
    if (!updated) return { error: "Active budget not found." };
  } catch {
    return { error: "Budget could not be updated." };
  }
  invalidateBudgets();
  redirect("/budgets");
}

async function setBudgetStatus(
  formData: FormData,
  status: "active" | "archived",
): Promise<BudgetActionState> {
  const user = await requireSessionUser();
  const id = budgetIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Budget not found." };
  try {
    const result = await setOwnedBudgetStatus(db, user.id, id.data, status);
    if (!result.ok) {
      return {
        error:
          result.reason === "duplicate"
            ? "Budget cannot be restored because an active budget already exists."
            : "Budget or active category is not available.",
      };
    }
  } catch {
    return { error: "Budget status could not be updated." };
  }
  invalidateBudgets();
  return {};
}

export async function archiveBudgetAction(
  _state: BudgetActionState,
  formData: FormData,
) {
  return setBudgetStatus(formData, "archived");
}

export async function restoreBudgetAction(
  _state: BudgetActionState,
  formData: FormData,
) {
  return setBudgetStatus(formData, "active");
}
