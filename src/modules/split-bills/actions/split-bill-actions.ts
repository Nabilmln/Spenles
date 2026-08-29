"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import { getOwnedSplitBillDetail } from "../queries/split-bills";
import {
  parseSplitBillPayload,
  paymentUpdateSchema,
  splitBillIdSchema,
  splitBillRevisionSchema,
} from "../schemas/split-bill";
import { calculateSplitBill, SplitBillCalculationError } from "../services/calculator";
import {
  archiveOwnedSplitBill,
  createOwnedSplitBillDraft,
  deleteOwnedSplitBill,
  deleteOwnedSplitBillDraft,
  prepareSplitBillDraft,
  replaceOwnedSplitBillDraft,
  type PreparedSplitBillDraft,
} from "../services/draft-mutations";
import { finalizeOwnedSplitBill } from "../services/finalization";
import { updateOwnedParticipantPayment } from "../services/payment-mutations";
import { createSplitBillShareSummary } from "../services/share-summary";

export type SplitBillActionState = {
  error?: string;
  success?: string;
  revision?: number;
  text?: string;
};

function preparedCalculationInput(input: PreparedSplitBillDraft) {
  return {
    discountMode: input.discountMode,
    fixedDiscountAmount: input.fixedDiscountAmount,
    discountBps: input.discountBps,
    billTaxMode: input.billTaxMode,
    fixedBillTaxAmount: input.fixedBillTaxAmount,
    billTaxBps: input.billTaxBps,
    serviceChargeBps: input.serviceChargeBps,
    participants: input.participants,
    items: input.items.map((item) => ({
      ...item,
      assignments: input.assignments
        .filter((assignment) => assignment.itemId === item.id)
        .map((assignment) => ({
          id: assignment.id,
          participantId: assignment.participantId,
        })),
    })),
  };
}

function calculationMessage(error: unknown) {
  return error instanceof SplitBillCalculationError
    ? error.message
    : "Tagihan belum dapat diproses.";
}

export async function createSplitBillAction(
  _state: SplitBillActionState,
  formData: FormData,
): Promise<SplitBillActionState> {
  const user = await requireSessionUser();
  const parsed = parseSplitBillPayload(formData.get("payload"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tagihan tidak valid." };
  }
  const prepared = prepareSplitBillDraft(parsed.data);
  let createdId: string;
  try {
    calculateSplitBill(preparedCalculationInput(prepared));
    const created = await createOwnedSplitBillDraft(db, user.id, prepared);
    if (!created) return { error: "Draft belum dapat dibuat." };
    createdId = created.id;
  } catch (error) {
    return { error: calculationMessage(error) };
  }
  redirect(`/split-bills/${createdId}/edit`);
}

export async function createAndFinalizeSplitBillAction(
  _state: SplitBillActionState,
  formData: FormData,
): Promise<SplitBillActionState> {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  const revision = splitBillRevisionSchema.safeParse(
    formData.get("expectedRevision"),
  );
  const parsed = parseSplitBillPayload(formData.get("payload"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tagihan tidak valid." };
  }
  const prepared = prepareSplitBillDraft(parsed.data);
  let finalizedBillId: string | null = null;
  try {
    calculateSplitBill(preparedCalculationInput(prepared));
    if (id.success && revision.success) {
      const updated = await replaceOwnedSplitBillDraft(
        db,
        user.id,
        id.data,
        revision.data,
        prepared,
      );
      if (!updated) {
        return {
          error:
            "Draft berubah di sesi lain atau sudah tidak dapat diedit. Muat ulang halaman.",
        };
      }
      const result = await finalizeOwnedSplitBill(
        db,
        user.id,
        id.data,
        updated.revision,
      );
      if (!result.ok) {
        return { error: "Finalisasi tidak berhasil. Coba lagi." };
      }
      finalizedBillId = id.data;
    } else {
      const created = await createOwnedSplitBillDraft(db, user.id, prepared);
      if (!created) return { error: "Tagihan belum dapat diproses." };
      const result = await finalizeOwnedSplitBill(
        db,
        user.id,
        created.id,
        created.revision,
      );
      if (!result.ok) {
        await deleteOwnedSplitBillDraft(db, user.id, created.id).catch(() => {});
        return { error: "Finalisasi tidak berhasil. Coba lagi." };
      }
      finalizedBillId = created.id;
    }
    revalidatePath("/split-bills");
  } catch (error) {
    return { error: calculationMessage(error) };
  }
  if (finalizedBillId === null) {
    return { error: "Finalisasi tidak berhasil. Coba lagi." };
  }
  redirect(`/split-bills/${finalizedBillId}`);
}

export async function updateSplitBillAction(
  _state: SplitBillActionState,
  formData: FormData,
): Promise<SplitBillActionState> {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  const revision = splitBillRevisionSchema.safeParse(
    formData.get("expectedRevision"),
  );
  const parsed = parseSplitBillPayload(formData.get("payload"));
  if (!id.success || !revision.success || !parsed.success) {
    return {
      error: parsed.success
        ? "Identitas draft tidak valid."
        : parsed.error.issues[0]?.message,
    };
  }
  const prepared = prepareSplitBillDraft(parsed.data);
  try {
    calculateSplitBill(preparedCalculationInput(prepared));
    const updated = await replaceOwnedSplitBillDraft(
      db,
      user.id,
      id.data,
      revision.data,
      prepared,
    );
    if (!updated) {
      return {
        error:
          "Draft berubah di sesi lain atau sudah tidak dapat diedit. Muat ulang halaman.",
      };
    }
    revalidatePath("/split-bills");
    revalidatePath(`/split-bills/${id.data}`);
    revalidatePath(`/split-bills/${id.data}/edit`);
    return {
      success: "Draft tersimpan dan terverifikasi di server.",
      revision: updated.revision,
    };
  } catch (error) {
    return { error: calculationMessage(error) };
  }
}

export async function deleteSplitBillDraftAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const deleted = await deleteOwnedSplitBillDraft(db, user.id, id.data);
  if (!deleted) return;
  revalidatePath("/split-bills");
  redirect("/split-bills");
}

export async function deleteSplitBillAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const deleted = await deleteOwnedSplitBill(db, user.id, id.data);
  if (!deleted) return;
  revalidatePath("/split-bills");
  redirect("/split-bills");
}

export async function archiveSplitBillAction(
  _state: SplitBillActionState,
  formData: FormData,
): Promise<SplitBillActionState> {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Tagihan tidak valid." };
  const archived = await archiveOwnedSplitBill(db, user.id, id.data);
  if (!archived) {
    return { error: "Tagihan tidak ditemukan atau tidak dapat diarsipkan." };
  }
  revalidatePath("/split-bills");
  revalidatePath(`/split-bills/${id.data}`);
  return { success: "Tagihan diarsipkan." };
}

export async function updateParticipantPaymentAction(
  _state: SplitBillActionState,
  formData: FormData,
): Promise<SplitBillActionState> {
  const user = await requireSessionUser();
  const parsed = paymentUpdateSchema.safeParse({
    billId: formData.get("billId"),
    participantId: formData.get("participantId"),
    status: formData.get("status"),
    paidAmount: formData.get("paidAmount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Status pembayaran tidak valid." };
  }
  const updated = await updateOwnedParticipantPayment(db, user.id, {
    ...parsed.data,
    paidAmount: BigInt(parsed.data.paidAmount),
  });
  if (!updated) {
    return {
      error:
        "Status tidak cocok dengan nominal kewajiban atau tagihan sudah diarsipkan.",
    };
  }
  revalidatePath(`/split-bills/${parsed.data.billId}`);
  return { success: "Status pembayaran diperbarui." };
}

export async function createShareSummaryAction(
  _state: SplitBillActionState,
  formData: FormData,
): Promise<SplitBillActionState> {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Tagihan tidak valid." };
  const detail = await getOwnedSplitBillDetail(user.id, id.data);
  if (
    !detail ||
    !detail.calculation ||
    (detail.bill.status !== "finalized" && detail.bill.status !== "archived")
  ) {
    return { error: "Ringkasan belum tersedia." };
  }
  const statusByParticipant = new Map(
    detail.participants.map((participant) => [
      participant.id,
      participant.paymentStatus,
    ]),
  );
  const itemBySourceId = new Map(
    detail.itemResults.map((item) => [item.sourceItemId, item]),
  );
  const itemsByParticipant = new Map<
    string,
    { name: string; unitPrice: string; quantity: number; amount: string }[]
  >();
  for (const assignment of detail.assignmentResults) {
    const item = itemBySourceId.get(assignment.sourceItemId);
    if (!item) continue;
    const entry = {
      name: item.nameSnapshot,
      unitPrice: item.unitPriceSnapshot.toString(),
      quantity: item.quantitySnapshot,
      amount: assignment.itemAmount.toString(),
    };
    const list = itemsByParticipant.get(assignment.sourceParticipantId) ?? [];
    list.push(entry);
    itemsByParticipant.set(assignment.sourceParticipantId, list);
  }
  return {
    text: createSplitBillShareSummary({
      merchantName: detail.calculation.merchantNameSnapshot,
      billDate: detail.calculation.billDateSnapshot,
      subtotalAmount: detail.calculation.subtotalAmount.toString(),
      taxAmount: (
        detail.calculation.itemTaxAmount + detail.calculation.billTaxAmount
      ).toString(),
      taxBps: detail.calculation.billTaxBps,
      taxMode: detail.calculation.billTaxMode,
      finalAmount: detail.calculation.finalAmount.toString(),
      participants: detail.participantResults.map((participant) => ({
        name: participant.nameSnapshot,
        finalAmount: participant.finalAmount.toString(),
        paymentStatus:
          statusByParticipant.get(participant.sourceParticipantId) ?? "unpaid",
        items: itemsByParticipant.get(participant.sourceParticipantId) ?? [],
      })),
      includePaymentStatus: formData.get("includePaymentStatus") === "on",
    }),
    success: "Ringkasan siap disalin.",
  };
}
