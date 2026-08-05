"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { parseJakartaDateTime } from "@/lib/dates/jakarta";
import { requireSessionUser } from "@/lib/auth/require-session";
import { transactionIdSchema, transactionSchema } from "../schemas/transaction";
import {
  createOwnedTransaction,
  softDeleteOwnedTransaction,
  updateOwnedTransaction,
} from "../services/transaction-mutations";

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
  const transactionAt = parseJakartaDateTime(parsed.data.transactionAt);
  if (!transactionAt) return { error: "Tanggal transaksi tidak valid." };
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
      return { error: "Akun atau kategori tidak tersedia untuk transaksi ini." };
    }
  } catch {
    return { error: "Transaksi belum dapat disimpan." };
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
    return { error: parsed.success ? "Transaksi tidak ditemukan." : parsed.error.issues[0]?.message };
  }
  const transactionAt = parseJakartaDateTime(parsed.data.transactionAt);
  if (!transactionAt) return { error: "Tanggal transaksi tidak valid." };
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
      return { error: "Transaksi tidak ditemukan atau pilihan sudah tidak tersedia." };
    }
  } catch {
    return { error: "Transaksi belum dapat diperbarui." };
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
