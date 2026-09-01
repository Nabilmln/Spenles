"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { preserveOrAttachNow } from "@/lib/dates/jakarta";
import { requireSessionUser } from "@/lib/auth/require-session";
import { transactionIdSchema, transactionSchema } from "../schemas/transaction";
import {
  createOwnedTransaction,
  softDeleteOwnedTransaction,
  updateOwnedTransaction,
} from "../services/transaction-mutations";
import { getTransaction } from "../queries/transactions";

export type TransactionActionState = { error?: string };

function input(formData: FormData) {
  return {
    type: formData.get("type"),
    amount: formData.get("amount"),
    accountId: formData.get("accountId"),
    categoryId: formData.get("categoryId"),
    transactionAt: formData.get("transactionAt"),
    note: formData.get("note") ?? "",
  };
}

export async function createTransactionAction(
  _state: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const user = await requireSessionUser();
  const parsed = transactionSchema.safeParse(input(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const transactionAt = preserveOrAttachNow(parsed.data.transactionAt);
  if (!transactionAt) return { error: "Invalid transaction date." };
  try {
    const created = await createOwnedTransaction(db, user.id, {
      type: parsed.data.type,
      amount: BigInt(parsed.data.amount),
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId,
      transactionAt,
      note: parsed.data.note,
    });
    if (!created) {
      return { error: "The account or category is not available for this transaction." };
    }
  } catch {
    return { error: "Transaction could not be saved." };
  }
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  redirect("/transactions");
}

export async function updateTransactionAction(
  _state: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const user = await requireSessionUser();
  const id = transactionIdSchema.safeParse(formData.get("id"));
  const parsed = transactionSchema.safeParse(input(formData));
  if (!id.success || !parsed.success) {
    return { error: parsed.success ? "Transaction not found." : parsed.error.issues[0]?.message };
  }
  const existing = await getTransaction(user.id, id.data);
  const transactionAt = preserveOrAttachNow(parsed.data.transactionAt, existing?.transactionAt);
  if (!transactionAt) return { error: "Invalid transaction date." };
  try {
    const updated = await updateOwnedTransaction(db, user.id, id.data, {
      type: parsed.data.type,
      amount: BigInt(parsed.data.amount),
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId,
      transactionAt,
      note: parsed.data.note,
    });
    if (!updated) {
      return { error: "Transaction not found or the selections are no longer available." };
    }
  } catch {
    return { error: "Transaction could not be updated." };
  }
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  redirect("/transactions");
}

export async function deleteTransactionAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = transactionIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const deleted = await softDeleteOwnedTransaction(db, user.id, id.data);
  if (!deleted) return;
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}
