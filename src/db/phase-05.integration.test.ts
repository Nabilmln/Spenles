import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  profiles,
  splitBillAssignments,
  splitBillCalculations,
  splitBillItems,
  splitBillParticipants,
  splitBills,
} from "@/db/schema";
import { ensureUserFoundationWithDatabase } from "@/modules/onboarding/services/ensure-user-foundation";
import {
  getOwnedSplitBillDetail,
  getOwnedSplitBillSource,
  listOwnedSplitBills,
} from "@/modules/split-bills/queries/split-bills";
import type { SplitBillDraftData } from "@/modules/split-bills/schemas/split-bill";
import {
  archiveOwnedSplitBill,
  createOwnedSplitBillDraft,
  deleteOwnedSplitBillDraft,
  prepareSplitBillDraft,
  replaceOwnedSplitBillDraft,
} from "@/modules/split-bills/services/draft-mutations";
import { finalizeOwnedSplitBill } from "@/modules/split-bills/services/finalization";
import { updateOwnedParticipantPayment } from "@/modules/split-bills/services/payment-mutations";
import { getTestDatabase } from "@/test/database";

const database = getTestDatabase();
const userA = `phase05-a-${randomUUID()}`;
const userB = `phase05-b-${randomUUID()}`;

function draft(merchantName = `Warung ${randomUUID()}`): SplitBillDraftData {
  const participantA = randomUUID();
  const participantB = randomUUID();
  return {
    merchantName,
    billDate: "2026-08-05",
    note: null,
    discountMode: "fixed",
    fixedDiscountAmount: "2000",
    discountBps: 0,
    billTaxBps: 1000,
    serviceChargeBps: 1000,
    participants: [
      { id: participantA, name: "Ayu" },
      { id: participantB, name: "Bima" },
    ],
    items: [
      {
        id: randomUUID(),
        name: "Makanan",
        quantity: 1,
        unitPrice: "10000",
        itemTaxBps: 1000,
        participantIds: [participantA],
      },
      {
        id: randomUUID(),
        name: "Minuman",
        quantity: 1,
        unitPrice: "10000",
        itemTaxBps: 0,
        participantIds: [participantB],
      },
    ],
  };
}

beforeAll(async () => {
  await ensureUserFoundationWithDatabase(database, {
    id: userA,
    name: "Phase 05 A",
  });
  await ensureUserFoundationWithDatabase(database, {
    id: userB,
    name: "Phase 05 B",
  });
});

afterAll(async () => {
  await database
    .delete(profiles)
    .where(inArray(profiles.userId, [userA, userB]));
});

describe("Phase 05 split-bill database boundaries", () => {
  it("saves an aggregate draft atomically and scopes replacement by owner and revision", async () => {
    const created = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(draft()),
    );
    expect(created).toMatchObject({ revision: 0 });
    const source = await getOwnedSplitBillSource(userA, created!.id, database);
    expect(source?.participants).toHaveLength(2);
    expect(source?.items).toHaveLength(2);
    expect(source?.assignments).toHaveLength(2);

    await expect(
      replaceOwnedSplitBillDraft(
        database,
        userB,
        created!.id,
        0,
        prepareSplitBillDraft(draft("Milik B")),
      ),
    ).resolves.toBeNull();
    const updated = await replaceOwnedSplitBillDraft(
      database,
      userA,
      created!.id,
      0,
      prepareSplitBillDraft(draft("Versi dua")),
    );
    expect(updated).toMatchObject({ revision: 1 });
    await expect(
      replaceOwnedSplitBillDraft(
        database,
        userA,
        created!.id,
        0,
        prepareSplitBillDraft(draft("Stale")),
      ),
    ).resolves.toBeNull();

    const persisted = await getOwnedSplitBillSource(
      userA,
      created!.id,
      database,
    );
    expect(persisted?.bill.merchantName).toBe("Versi dua");
    expect(persisted?.participants).toHaveLength(2);
    expect(persisted?.items).toHaveLength(2);
    expect(persisted?.assignments).toHaveLength(2);
  });

  it("finalizes one immutable, exactly reconciled snapshot", async () => {
    const created = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(draft()),
    );
    const finalized = await finalizeOwnedSplitBill(
      database,
      userA,
      created!.id,
      0,
    );
    expect(finalized.ok).toBe(true);
    const detail = await getOwnedSplitBillDetail(userA, created!.id, database);
    expect(detail?.bill.status).toBe("finalized");
    expect(detail?.calculation?.calculationVersion).toBe(1);
    expect(detail?.calculation?.finalAmount).toBe(21_600n);
    expect(detail?.itemResults).toHaveLength(2);
    expect(detail?.assignmentResults).toHaveLength(2);
    expect(detail?.participantResults).toHaveLength(2);
    expect(
      detail?.participantResults.reduce(
        (sum, participant) => sum + participant.finalAmount,
        0n,
      ),
    ).toBe(detail?.calculation?.finalAmount);

    await expect(
      replaceOwnedSplitBillDraft(
        database,
        userA,
        created!.id,
        1,
        prepareSplitBillDraft(draft("Tidak boleh")),
      ),
    ).resolves.toBeNull();
    await expect(
      deleteOwnedSplitBillDraft(database, userA, created!.id),
    ).resolves.toBeNull();
    await expect(
      getOwnedSplitBillDetail(userB, created!.id, database),
    ).resolves.toBeNull();
  });

  it("makes concurrent finalization idempotent", async () => {
    const created = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(draft()),
    );
    const results = await Promise.all([
      finalizeOwnedSplitBill(database, userA, created!.id, 0),
      finalizeOwnedSplitBill(database, userA, created!.id, 0),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    const calculations = await database
      .select()
      .from(splitBillCalculations);
    expect(
      calculations.filter((row) => row.splitBillId === created!.id),
    ).toHaveLength(1);
  });

  it("marks zero-obligation participants paid without creating money", async () => {
    const input = draft();
    input.discountMode = "percentage";
    input.fixedDiscountAmount = "0";
    input.discountBps = 10_000;
    input.billTaxBps = 1_000;
    input.serviceChargeBps = 1_000;
    const created = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(input),
    );
    await finalizeOwnedSplitBill(database, userA, created!.id, 0);
    const detail = await getOwnedSplitBillDetail(userA, created!.id, database);
    expect(detail?.calculation?.finalAmount).toBe(0n);
    expect(detail?.participantResults.every((row) => row.finalAmount === 0n))
      .toBe(true);
    expect(detail?.participants.every((row) => row.paymentStatus === "paid"))
      .toBe(true);
  });

  it("bounds payment state by the immutable obligation and freezes it after archival", async () => {
    const created = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(draft()),
    );
    await finalizeOwnedSplitBill(database, userA, created!.id, 0);
    const detail = await getOwnedSplitBillDetail(userA, created!.id, database);
    const participant = detail!.participantResults[0]!;

    await expect(
      updateOwnedParticipantPayment(database, userB, {
        billId: created!.id,
        participantId: participant.sourceParticipantId,
        status: "paid",
        paidAmount: participant.finalAmount,
      }),
    ).resolves.toBeNull();
    await expect(
      updateOwnedParticipantPayment(database, userA, {
        billId: created!.id,
        participantId: participant.sourceParticipantId,
        status: "partially_paid",
        paidAmount: participant.finalAmount,
      }),
    ).resolves.toBeNull();
    await expect(
      updateOwnedParticipantPayment(database, userA, {
        billId: created!.id,
        participantId: participant.sourceParticipantId,
        status: "partially_paid",
        paidAmount: 1n,
      }),
    ).resolves.toMatchObject({ id: participant.sourceParticipantId });
    await expect(
      updateOwnedParticipantPayment(database, userA, {
        billId: created!.id,
        participantId: participant.sourceParticipantId,
        status: "paid",
        paidAmount: participant.finalAmount,
      }),
    ).resolves.toMatchObject({ id: participant.sourceParticipantId });
    await expect(
      archiveOwnedSplitBill(database, userA, created!.id),
    ).resolves.toMatchObject({ id: created!.id });
    await expect(
      updateOwnedParticipantPayment(database, userA, {
        billId: created!.id,
        participantId: participant.sourceParticipantId,
        status: "unpaid",
        paidAmount: 0n,
      }),
    ).resolves.toBeNull();
  });

  it("hard-deletes only owned drafts and cascades every source child", async () => {
    const created = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(draft()),
    );
    await expect(
      deleteOwnedSplitBillDraft(database, userB, created!.id),
    ).resolves.toBeNull();
    await expect(
      deleteOwnedSplitBillDraft(database, userA, created!.id),
    ).resolves.toMatchObject({ id: created!.id });
    const [bills, participants, items, assignments] = await Promise.all([
      database.select().from(splitBills),
      database.select().from(splitBillParticipants),
      database.select().from(splitBillItems),
      database.select().from(splitBillAssignments),
    ]);
    expect(bills.some((row) => row.id === created!.id)).toBe(false);
    expect(participants.some((row) => row.splitBillId === created!.id)).toBe(false);
    expect(items.some((row) => row.splitBillId === created!.id)).toBe(false);
    expect(assignments.some((row) => row.splitBillId === created!.id)).toBe(false);
  });

  it("keeps history private, deterministic, and archived-hidden by default", async () => {
    const merchant = `Riwayat ${randomUUID()}`;
    const draftA = await createOwnedSplitBillDraft(
      database,
      userA,
      prepareSplitBillDraft(draft(merchant)),
    );
    await createOwnedSplitBillDraft(
      database,
      userB,
      prepareSplitBillDraft(draft(merchant)),
    );
    await finalizeOwnedSplitBill(database, userA, draftA!.id, 0);
    await archiveOwnedSplitBill(database, userA, draftA!.id);

    const defaults = await listOwnedSplitBills(
      userA,
      { q: merchant, page: 1, pageSize: 20 },
      database,
    );
    expect(defaults.total).toBe(0);
    const archived = await listOwnedSplitBills(
      userA,
      {
        q: merchant,
        status: "archived",
        page: 1,
        pageSize: 20,
      },
      database,
    );
    expect(archived.total).toBe(1);
    expect(archived.rows[0]?.id).toBe(draftA!.id);
  });
});
