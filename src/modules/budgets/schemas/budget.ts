import { z } from "zod";
import { isCanonicalMonth } from "@/lib/dates/jakarta-month";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money/format-idr";

export const budgetIdSchema = z.uuid();

export const budgetSchema = z.object({
  categoryId: z.uuid("Kategori tidak valid."),
  month: z.string().refine(isCanonicalMonth, "Bulan anggaran tidak valid."),
  amount: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/u, "Anggaran harus berupa rupiah bulat positif.")
    .refine((value) => /^[1-9]\d*$/u.test(value) && BigInt(value) <= MAX_TRANSACTION_AMOUNT, {
      message: "Anggaran melewati batas yang didukung.",
    }),
  warningThresholdBps: z.coerce
    .number()
    .int()
    .min(100, "Ambang minimum adalah 1%.")
    .max(10_000, "Ambang maksimum adalah 100%."),
});
