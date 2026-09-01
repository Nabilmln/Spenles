"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import { parseJakartaDateTime, preserveOrAttachNow } from "@/lib/dates/jakarta";
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
  const transferredAt = /^\d{4}-\d{2}-\d{2}$/u.test(parsed.data.transferredAt)
    ? preserveOrAttachNow(parsed.data.transferredAt)
    : parseJakartaDateTime(parsed.data.transferredAt);
  if (!transferredAt || transferredAt.getTime() > Date.now()) {
    return { error: "Transfer time is invalid or in the future." };
  }
  try {
    const created = await createOwnedTransfer(db, user.id, {
      ...parsed.data,
      amount: BigInt(parsed.data.amount),
      transferredAt,
    });
    if (!created) {
      return { error: "Both accounts must be active, different, and owned by you." };
    }
  } catch {
    return { error: "Transfer could not be saved." };
  }
  invalidateTransfers();
  return { success: "Transfer recorded successfully." };
}

export async function reverseTransferAction(
  _state: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const user = await requireSessionUser();
  const id = transferIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Transfer not found." };
  try {
    const result = await reverseOwnedTransfer(db, user.id, id.data);
    if (!result.ok) {
      return { error: "Transfer is unavailable or has already been reversed." };
    }
  } catch {
    return { error: "Transfer could not be reversed." };
  }
  invalidateTransfers();
  return { success: "Transfer reversal recorded successfully." };
}
