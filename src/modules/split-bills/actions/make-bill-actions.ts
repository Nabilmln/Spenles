"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireSessionUser } from "@/lib/auth/require-session";
import {
  parseSplitBillPayload,
  splitBillIdSchema,
  splitBillRevisionSchema,
} from "../schemas/split-bill";
import { calculateSplitBill, SplitBillCalculationError } from "../services/calculator";
import {
  createOwnedSplitBillDraft,
  deleteOwnedSplitBillDraft,
  prepareSplitBillDraft,
  replaceOwnedSplitBillDraft,
  type PreparedSplitBillDraft,
} from "../services/draft-mutations";
import { finalizeOwnedSplitBill } from "../services/finalization";

export type MakeBillActionState = {
  error?: string;
  success?: string;
  id?: string;
  revision?: number;
  finalizedId?: string;
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
  if (error instanceof SplitBillCalculationError) return error.message;
  const detail =
    typeof (error as { cause?: { message?: string } }).cause?.message ===
    "string"
      ? (error as { cause: { message: string } }).cause.message
      : error instanceof Error && error.message
        ? error.message
        : "unknown error";
  return `The bill could not be processed: ${detail}`;
}

export async function saveSplitBillDraftAction(
  _state: MakeBillActionState,
  formData: FormData,
): Promise<MakeBillActionState> {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  const revision = splitBillRevisionSchema.safeParse(
    formData.get("expectedRevision"),
  );
  const parsed = parseSplitBillPayload(formData.get("payload"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid bill data." };
  }
  const prepared = prepareSplitBillDraft(parsed.data);
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
            "The draft changed in another session or can no longer be edited. Reload the page.",
        };
      }
      revalidatePath("/split-bills");
      return {
        success: "Split Bill saved as draft.",
        id: id.data,
        revision: updated.revision,
      };
    }
    const created = await createOwnedSplitBillDraft(db, user.id, prepared);
    if (!created) return { error: "The draft could not be created." };
    revalidatePath("/split-bills");
    return {
      success: "Split Bill saved as draft.",
      id: created.id,
      revision: created.revision,
    };
  } catch (error) {
    return { error: calculationMessage(error) };
  }
}

export async function finalizeSplitBillAction(
  _state: MakeBillActionState,
  formData: FormData,
): Promise<MakeBillActionState> {
  const user = await requireSessionUser();
  const id = splitBillIdSchema.safeParse(formData.get("id"));
  const revision = splitBillRevisionSchema.safeParse(
    formData.get("expectedRevision"),
  );
  const parsed = parseSplitBillPayload(formData.get("payload"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid bill data." };
  }
  const prepared = prepareSplitBillDraft(parsed.data);
  let finalizedId: string | null = null;
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
            "The draft changed in another session or can no longer be edited. Reload the page.",
        };
      }
      const result = await finalizeOwnedSplitBill(
        db,
        user.id,
        id.data,
        updated.revision,
      );
      if (!result.ok) {
        return { error: "Finalization failed. Please try again." };
      }
      finalizedId = id.data;
    } else {
      const created = await createOwnedSplitBillDraft(db, user.id, prepared);
      if (!created) return { error: "The bill could not be processed." };
      const result = await finalizeOwnedSplitBill(
        db,
        user.id,
        created.id,
        created.revision,
      );
      if (!result.ok) {
        await deleteOwnedSplitBillDraft(db, user.id, created.id).catch(() => {});
        return { error: "Finalization failed. Please try again." };
      }
      finalizedId = created.id;
    }
    revalidatePath("/split-bills");
  } catch (error) {
    return { error: calculationMessage(error) };
  }
  if (!finalizedId) {
    return { error: "Finalization failed. Please try again." };
  }
  return { success: "Split Bill finalized.", finalizedId };
}