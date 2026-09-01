import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAndFinalizeSplitBillAction,
} from "./split-bill-actions";

const mocks = vi.hoisted(() => ({
  requireSessionUser: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  createOwnedSplitBillDraft: vi.fn(),
  finalizeOwnedSplitBill: vi.fn(),
  replaceOwnedSplitBillDraft: vi.fn(),
  deleteOwnedSplitBillDraft: vi.fn(),
  calculateSplitBill: vi.fn(),
}));

vi.mock("@/lib/auth/require-session", () => ({
  requireSessionUser: mocks.requireSessionUser,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("../services/draft-mutations", () => ({
  createOwnedSplitBillDraft: mocks.createOwnedSplitBillDraft,
  replaceOwnedSplitBillDraft: mocks.replaceOwnedSplitBillDraft,
  deleteOwnedSplitBillDraft: mocks.deleteOwnedSplitBillDraft,
  prepareSplitBillDraft: (input: {
    participants: { id: string; name: string }[];
    items: {
      id: string;
      name: string;
      quantity: number;
      unitPrice: string;
      participantIds: string[];
    }[];
  }) => ({
    ...input,
    participants: input.participants.map((participant, index) => ({
      ...participant,
      position: index + 1,
    })),
    items: input.items.map((item, index) => ({
      ...item,
      unitPrice: BigInt(item.unitPrice),
      position: index + 1,
    })),
    assignments: input.items.flatMap((item) =>
      item.participantIds.map((participantId) => ({
        id: `${item.id}:${participantId}`,
        itemId: item.id,
        participantId,
      })),
    ),
  }),
}));
vi.mock("../services/finalization", () => ({
  finalizeOwnedSplitBill: mocks.finalizeOwnedSplitBill,
}));
vi.mock("../services/calculator", () => ({
  calculateSplitBill: mocks.calculateSplitBill,
  SplitBillCalculationError: class SplitBillCalculationError extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  },
}));
vi.mock("../services/payment-mutations", () => ({
  updateOwnedParticipantPayment: vi.fn(),
}));
vi.mock("../services/share-summary", () => ({
  createSplitBillShareSummary: vi.fn(),
}));

const participantId = "00000000-0000-4000-8000-000000000001";
const itemId = "10000000-0000-4000-8000-000000000001";

function validPayload() {
  return JSON.stringify({
    merchantName: "Warung",
    billDate: "2026-08-05",
    note: "",
    discountMode: "none",
    fixedDiscountAmount: "0",
    discountBps: 0,
    billTaxMode: "percentage",
    fixedBillTaxAmount: "0",
    billTaxBps: 0,
    serviceChargeBps: 0,
    participants: [{ id: participantId, name: "Ayu" }],
    items: [
      {
        id: itemId,
        name: "Nasi",
        quantity: 1,
        unitPrice: "10000",
        itemTaxBps: 0,
        participantIds: [participantId],
      },
    ],
  });
}

function formData(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set("payload", validPayload());
  Object.entries(overrides).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("createAndFinalizeSplitBillAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSessionUser.mockResolvedValue({ id: "user-a" });
    mocks.calculateSplitBill.mockReturnValue({});
  });

  it("redirects to the detail page after a successful direct finalize", async () => {
    mocks.createOwnedSplitBillDraft.mockResolvedValue({
      id: "bill-1",
      revision: 0,
    });
    mocks.finalizeOwnedSplitBill.mockResolvedValue({ ok: true, id: "bill-1" });

    const result = await createAndFinalizeSplitBillAction({}, formData());

    expect(result).toBeUndefined();
    expect(mocks.createOwnedSplitBillDraft).toHaveBeenCalledTimes(1);
    expect(mocks.finalizeOwnedSplitBill).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/split-bills");
    expect(mocks.redirect).toHaveBeenCalledWith("/split-bills/bill-1");
  });

  it("returns a validation error without creating a record for invalid payload", async () => {
    const form = new FormData();
    form.set("payload", JSON.stringify({ merchantName: "" }));

    const result = await createAndFinalizeSplitBillAction({}, form);

    expect(result.error).toBeTruthy();
    expect(mocks.createOwnedSplitBillDraft).not.toHaveBeenCalled();
    expect(mocks.finalizeOwnedSplitBill).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("returns a finalization error and deletes the fresh draft when finalize fails", async () => {
    mocks.createOwnedSplitBillDraft.mockResolvedValue({
      id: "bill-1",
      revision: 0,
    });
    mocks.finalizeOwnedSplitBill.mockResolvedValue({
      ok: false,
      reason: "conflict",
    });
    mocks.deleteOwnedSplitBillDraft.mockResolvedValue({ id: "bill-1" });

    const result = await createAndFinalizeSplitBillAction({}, formData());

    expect(result.error).toBe("Finalization failed. Please try again.");
    expect(mocks.deleteOwnedSplitBillDraft).toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("does not redirect when calculation validation throws", async () => {
    mocks.calculateSplitBill.mockImplementation(() => {
      throw new Error("calculation failed");
    });

    const result = await createAndFinalizeSplitBillAction({}, formData());

    expect(result.error).toBe("The bill could not be processed.");
    expect(mocks.createOwnedSplitBillDraft).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});