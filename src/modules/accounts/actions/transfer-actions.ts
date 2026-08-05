"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import { parseJakartaDateTime } from "@/lib/dates/jakarta";
import { transferIdSchema, transferSchema } from "../schemas/transfer";
import {
  createOwnedTransfer,
  reverseOwnedTransfer,
} from "../services/transfer-mutations";

export type TransferActionState = { error?: string; success?: string };

function invalidateTransfers() {
  revalidatePath("/accounts");
  revalidatePath("/transfers");
  revalidatePath("/dashboard");
}

export async function createTransferAction(
  _state: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const user = await requireSessionUser();
  const parsed = transferSchema.safeParse({
    sourceAccountId: formData.get("sourceAccountId"),
    destinationAccountId: formData.get("destinationAccountId"),
    amount: formData.get("amount"),
    transferredAt: formData.get("transferredAt"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const transferredAt = parseJakartaDateTime(parsed.data.transferredAt);
  if (!transferredAt || transferredAt.getTime() > Date.now()) {
    return { error: "Waktu transfer tidak valid atau berada di masa depan." };
  }
  try {
    const created = await createOwnedTransfer(db, user.id, {
      ...parsed.data,
      amount: BigInt(parsed.data.amount),
      transferredAt,
    });
    if (!created) {
      return { error: "Kedua akun harus aktif, berbeda, dan milik Anda." };
    }
  } catch {
    return { error: "Transfer belum dapat disimpan." };
  }
  invalidateTransfers();
  return { success: "Transfer berhasil dicatat." };
}

export async function reverseTransferAction(
  _state: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const user = await requireSessionUser();
  const id = transferIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Transfer tidak ditemukan." };
  try {
    const result = await reverseOwnedTransfer(db, user.id, id.data);
    if (!result.ok) {
      return { error: "Transfer tidak tersedia atau sudah pernah dibalik." };
    }
  } catch {
    return { error: "Transfer belum dapat dibalik." };
  }
  invalidateTransfers();
  return { success: "Pembalikan transfer berhasil dicatat." };
}
