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
  if (!startAt) return { error: "Waktu mulai tidak valid." };
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
      return { error: "Akun atau kategori aktif tidak tersedia." };
    }
  } catch {
    return { error: "Aturan berulang belum dapat dibuat." };
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
        ? "Aturan berulang tidak ditemukan."
        : parsed.error.issues[0]?.message,
    };
  }
  const existing = await getOwnedRecurringRule(user.id, id.data);
  if (!existing || existing.status === "archived") {
    return { error: "Aturan berulang tidak ditemukan." };
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
    if (!updated) return { error: "Pilihan akun atau kategori tidak tersedia." };
  } catch {
    return { error: "Aturan berulang belum dapat diperbarui." };
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
  if (!id.success) return { error: "Aturan berulang tidak ditemukan." };
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
            ? "Aturan tidak dapat dilanjutkan. Periksa akun, kategori, dan tanggal selesai."
            : "Aturan berulang tidak ditemukan.",
      };
    }
  } catch {
    return { error: "Status aturan berulang belum dapat diperbarui." };
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
