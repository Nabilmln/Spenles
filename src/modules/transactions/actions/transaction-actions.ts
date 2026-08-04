"use server";

import { and, eq, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { accounts, categories, transactions } from "@/db/schema";
import { parseJakartaDateTime } from "@/lib/dates/jakarta";
import { requireSessionUser } from "@/lib/auth/require-session";
import { transactionIdSchema, transactionSchema } from "../schemas/transaction";

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

async function validateOwnedOptions(
  userId: string,
  accountId: string,
  categoryId: string,
  type: "income" | "expense",
  existingCategoryId?: string,
) {
  const [account, category] = await Promise.all([
    db.query.accounts.findFirst({
      where: and(
        eq(accounts.id, accountId),
        eq(accounts.userId, userId),
        eq(accounts.status, "active"),
        eq(accounts.currency, "IDR"),
      ),
    }),
    db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId),
        existingCategoryId
          ? or(eq(categories.status, "active"), eq(categories.id, existingCategoryId))
          : eq(categories.status, "active"),
        eq(categories.type, type),
      ),
    }),
  ]);
  return Boolean(account && category);
}

export async function createTransactionAction(
  _state: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const user = await requireSessionUser();
  const parsed = transactionSchema.safeParse(input(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!(await validateOwnedOptions(user.id, parsed.data.accountId, parsed.data.categoryId, parsed.data.type))) {
    return { error: "Akun atau kategori tidak tersedia untuk transaksi ini." };
  }
  const transactionAt = parseJakartaDateTime(parsed.data.transactionAt);
  if (!transactionAt) return { error: "Tanggal transaksi tidak valid." };
  try {
    await db.insert(transactions).values({
      userId: user.id,
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId,
      type: parsed.data.type,
      amount: BigInt(parsed.data.amount),
      transactionAt,
      note: parsed.data.note,
    });
  } catch {
    return { error: "Transaksi belum dapat disimpan." };
  }
  revalidatePath("/transactions");
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
  const existing = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id.data), eq(transactions.userId, user.id), isNull(transactions.deletedAt)),
  });
  if (!existing) return { error: "Transaksi tidak ditemukan." };
  if (!(await validateOwnedOptions(
    user.id,
    parsed.data.accountId,
    parsed.data.categoryId,
    parsed.data.type,
    existing.categoryId,
  ))) {
    return { error: "Akun atau kategori tidak tersedia untuk transaksi ini." };
  }
  const transactionAt = parseJakartaDateTime(parsed.data.transactionAt);
  if (!transactionAt) return { error: "Tanggal transaksi tidak valid." };
  await db
    .update(transactions)
    .set({
      accountId: parsed.data.accountId,
      categoryId: parsed.data.categoryId,
      type: parsed.data.type,
      amount: BigInt(parsed.data.amount),
      transactionAt,
      note: parsed.data.note,
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id.data), eq(transactions.userId, user.id), isNull(transactions.deletedAt)));
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function deleteTransactionAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = transactionIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  await db
    .update(transactions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(transactions.id, id.data), eq(transactions.userId, user.id), isNull(transactions.deletedAt)));
  revalidatePath("/transactions");
}
