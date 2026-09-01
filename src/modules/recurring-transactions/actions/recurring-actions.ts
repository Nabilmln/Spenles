"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  parseJakartaDateTime,
} from "@/lib/dates/jakarta";
import {
  firstOccurrenceAfter,
  initialOccurrence,
} from "@/lib/dates/recurrence";
import { getOwnedRecurringRule } from "../queries/recurring-rules";
import {
  recurringRuleIdSchema,
  recurringRuleSchema,
} from "../schemas/recurring-rule";
import {
  archiveOwnedRecurringRule,
  createOwnedRecurringRule,
  pauseOwnedRecurringRule,
  resumeOwnedRecurringRule,
  updateOwnedRecurringRule,
} from "../services/recurring-mutations";

export type RecurringActionState = { error?: string };

function parse(formData: FormData) {
  return recurringRuleSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    accountId: formData.get("accountId"),
    categoryId: formData.get("categoryId"),
    frequency: formData.get("frequency"),
    startAt: formData.get("startAt"),
    endDate: formData.get("endDate") ?? "",
    note: formData.get("note") ?? "",
  });
}

function invalidateRecurring() {
  revalidatePath("/recurring-transactions");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function createRecurringRuleAction(
  _state: RecurringActionState,
  formData: FormData,
): Promise<RecurringActionState> {
  const user = await requireSessionUser();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const startAt = parseJakartaDateTime(parsed.data.startAt);
  if (!startAt) return { error: "Invalid start time." };
  const next = initialOccurrence(
    startAt,
    parsed.data.frequency,
    new Date(),
    parsed.data.endDate,
  );
  try {
    const created = await createOwnedRecurringRule(db, user.id, {
      ...parsed.data,
      amount: BigInt(parsed.data.amount),
      startAt,
      nextOccurrenceAt: next,
    });
    if (!created) {
      return { error: "Account or active category is not available." };
    }
  } catch {
    return { error: "Recurring rule could not be created." };
  }
  invalidateRecurring();
  redirect("/recurring-transactions");
}

export async function updateRecurringRuleAction(
  _state: RecurringActionState,
  formData: FormData,
): Promise<RecurringActionState> {
  const user = await requireSessionUser();
  const id = recurringRuleIdSchema.safeParse(formData.get("id"));
  const parsed = parse(formData);
  if (!id.success || !parsed.success) {
    return {
      error: parsed.success
        ? "Recurring rule not found."
        : parsed.error.issues[0]?.message,
    };
  }
  const existing = await getOwnedRecurringRule(user.id, id.data);
  if (!existing || existing.status === "archived") {
    return { error: "Recurring rule not found." };
  }
  const next =
    existing.status === "active"
      ? firstOccurrenceAfter(
          existing.startAt,
          parsed.data.frequency,
          new Date(),
          parsed.data.endDate,
        )
      : existing.nextOccurrenceAt;
  try {
    const updated = await updateOwnedRecurringRule(db, user.id, id.data, {
      ...parsed.data,
      amount: BigInt(parsed.data.amount),
      nextOccurrenceAt: next,
    });
    if (!updated) return { error: "Selected account or category is not available." };
  } catch {
    return { error: "Recurring rule could not be updated." };
  }
  invalidateRecurring();
  redirect("/recurring-transactions");
}

async function mutateStatus(
  formData: FormData,
  operation: "pause" | "resume" | "archive",
): Promise<RecurringActionState> {
  const user = await requireSessionUser();
  const id = recurringRuleIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Recurring rule not found." };
  try {
    const result =
      operation === "pause"
        ? await pauseOwnedRecurringRule(db, user.id, id.data)
        : operation === "resume"
          ? await resumeOwnedRecurringRule(db, user.id, id.data, new Date())
          : await archiveOwnedRecurringRule(db, user.id, id.data);
    if (!result) {
      return {
        error:
          operation === "resume"
            ? "Rule cannot be resumed. Check the account, category, and end date."
            : "Recurring rule not found.",
      };
    }
  } catch {
    return { error: "Recurring rule status could not be updated." };
  }
  invalidateRecurring();
  return {};
}

export async function pauseRecurringRuleAction(
  _state: RecurringActionState,
  formData: FormData,
) {
  return mutateStatus(formData, "pause");
}

export async function resumeRecurringRuleAction(
  _state: RecurringActionState,
  formData: FormData,
) {
  return mutateStatus(formData, "resume");
}

export async function archiveRecurringRuleAction(
  _state: RecurringActionState,
  formData: FormData,
) {
  return mutateStatus(formData, "archive");
}
