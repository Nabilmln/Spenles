import { z } from "zod";
import {
  SPLIT_BILL_MAX_ASSIGNMENTS,
  SPLIT_BILL_MAX_ITEMS,
  SPLIT_BILL_MAX_MONEY,
  SPLIT_BILL_MAX_PARTICIPANTS,
  SPLIT_BILL_MAX_QUANTITY,
} from "../constants/limits";

const money = z
  .string()
  .trim()
  .regex(/^\d+$/u, "Nominal harus berupa rupiah bulat.")
  .refine((value) => BigInt(value) <= SPLIT_BILL_MAX_MONEY, {
    message: "Nominal berada di luar rentang yang didukung.",
  });

const basisPoints = z.coerce.number().int().min(0).max(10_000);

function validDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

const participantSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(100),
});

const itemSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(SPLIT_BILL_MAX_QUANTITY),
  unitPrice: money.refine((value) => BigInt(value) > 0n, {
    message: "Harga satuan harus positif.",
  }),
  itemTaxBps: basisPoints,
  participantIds: z.array(z.uuid()).min(1).max(SPLIT_BILL_MAX_PARTICIPANTS),
});

export const splitBillDraftSchema = z
  .object({
    merchantName: z.string().trim().min(1).max(120),
    billDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .refine(validDate, "Tanggal tagihan tidak valid."),
    note: z
      .string()
      .trim()
      .max(500)
      .transform((value) => value || null),
    discountMode: z.enum(["none", "fixed", "percentage"]),
    fixedDiscountAmount: money,
    discountBps: basisPoints,
    billTaxBps: basisPoints,
    serviceChargeBps: basisPoints,
    participants: z
      .array(participantSchema)
      .min(1)
      .max(SPLIT_BILL_MAX_PARTICIPANTS),
    items: z.array(itemSchema).min(1).max(SPLIT_BILL_MAX_ITEMS),
  })
  .superRefine((value, context) => {
    const participantIds = new Set(value.participants.map(({ id }) => id));
    if (participantIds.size !== value.participants.length) {
      context.addIssue({ code: "custom", message: "Peserta harus unik." });
    }
    const itemIds = new Set(value.items.map(({ id }) => id));
    if (itemIds.size !== value.items.length) {
      context.addIssue({ code: "custom", message: "Item harus unik." });
    }
    const assignmentCount = value.items.reduce(
      (total, item) => total + item.participantIds.length,
      0,
    );
    if (assignmentCount > SPLIT_BILL_MAX_ASSIGNMENTS) {
      context.addIssue({
        code: "custom",
        message: "Jumlah penetapan peserta terlalu banyak.",
      });
    }
    for (const item of value.items) {
      if (new Set(item.participantIds).size !== item.participantIds.length) {
        context.addIssue({
          code: "custom",
          message: `Peserta pada item ${item.name} harus unik.`,
        });
      }
      if (item.participantIds.some((id) => !participantIds.has(id))) {
        context.addIssue({
          code: "custom",
          message: `Peserta pada item ${item.name} tidak valid.`,
        });
      }
      if (
        BigInt(item.quantity) * BigInt(item.unitPrice) >
        SPLIT_BILL_MAX_MONEY
      ) {
        context.addIssue({
          code: "custom",
          message: `Subtotal item ${item.name} terlalu besar.`,
        });
      }
    }
    if (
      (value.discountMode === "none" &&
        (BigInt(value.fixedDiscountAmount) !== 0n ||
          value.discountBps !== 0)) ||
      (value.discountMode === "fixed" &&
        (BigInt(value.fixedDiscountAmount) <= 0n ||
          value.discountBps !== 0)) ||
      (value.discountMode === "percentage" &&
        (BigInt(value.fixedDiscountAmount) !== 0n ||
          value.discountBps < 1))
    ) {
      context.addIssue({
        code: "custom",
        message: "Konfigurasi diskon tidak valid.",
      });
    }
  });

export const splitBillIdSchema = z.uuid();
export const splitBillRevisionSchema = z.coerce.number().int().min(0);

export const paymentUpdateSchema = z.object({
  billId: z.uuid(),
  participantId: z.uuid(),
  status: z.enum(["unpaid", "partially_paid", "paid"]),
  paidAmount: money,
});

export type SplitBillDraftData = z.infer<typeof splitBillDraftSchema>;

export function parseSplitBillPayload(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return splitBillDraftSchema.safeParse(undefined);
  }
  try {
    return splitBillDraftSchema.safeParse(JSON.parse(value));
  } catch {
    return splitBillDraftSchema.safeParse(undefined);
  }
}
