"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import { budgetIdSchema, budgetSchema } from "../schemas/budget";
import {
  createOwnedBudget,
  setOwnedBudgetStatus,
  updateOwnedBudget,
} from "../services/budget-mutations";

export type BudgetActionState = { error?: string; success?: string };

function parse(formData: FormData) {
  return budgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    periodType: formData.get("periodType"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
    amount: formData.get("amount"),
    warningMode: formData.get("warningMode"),
    warningThresholdBps: formData.get("warningThresholdBps"),
    warningDaysRemaining: formData.get("warningDaysRemaining"),
  });
}

function invalidateBudgets() {
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

function warningValues(parsed: {
  warningMode: "threshold" | "days";
  warningThresholdBps: number | null;
  warningDaysRemaining: number | null;
}) {
  return {
    warningThresholdBps:
      parsed.warningMode === "threshold" ? parsed.warningThresholdBps : null,
    warningDaysRemaining:
      parsed.warningMode === "days" ? parsed.warningDaysRemaining : null,
  };
}

export async function createBudgetAction(
  _state: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const user = await requireSessionUser();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const warning = warningValues(parsed.data);
  try {
    const result = await createOwnedBudget(db, user.id, {
      categoryId: parsed.data.categoryId,
      periodType: parsed.data.periodType,
      periodStart:
        parsed.data.periodType === "custom" ? parsed.data.periodStart : null,
      periodEnd:
        parsed.data.periodType === "custom" ? parsed.data.periodEnd : null,
      amount: BigInt(parsed.data.amount),
      ...warning,
    });
    if (!result.ok) {
      return {
        error:
          result.reason === "duplicate"
            ? "An active budget for that category already exists."
            : "Expense category is not available.",
      };
    }
  } catch {
    return { error: "Budget could not be created." };
  }
  invalidateBudgets();
  return { success: "Budget created." };
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
  const warning = warningValues(parsed.data);
  try {
    const updated = await updateOwnedBudget(db, user.id, id.data, {
      categoryId: parsed.data.categoryId,
      periodType: parsed.data.periodType,
      periodStart:
        parsed.data.periodType === "custom" ? parsed.data.periodStart : null,
      periodEnd:
        parsed.data.periodType === "custom" ? parsed.data.periodEnd : null,
      amount: BigInt(parsed.data.amount),
      ...warning,
    });
    if (!updated) return { error: "Active budget or category is not available." };
  } catch {
    return { error: "Budget could not be updated." };
  }
  invalidateBudgets();
  return { success: "Budget updated." };
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
  return { success: status === "active" ? "Budget restored." : "Budget archived." };
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