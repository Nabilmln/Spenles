import { z } from "zod";
import { isCanonicalMonth } from "@/lib/dates/jakarta-month";
import { moneyString } from "@/lib/money/schema";

export const budgetIdSchema = z.uuid();

export const budgetSchema = z.object({
  categoryId: z.uuid("Kategori tidak valid."),
  month: z.string().refine(isCanonicalMonth, "Bulan anggaran tidak valid."),
  amount: moneyString({
    formatMessage: "Anggaran harus berupa rupiah bulat positif.",
    rangeMessage: "Anggaran melewati batas yang didukung.",
  }),
  warningThresholdBps: z.coerce
    .number()
    .int()
    .min(100, "Ambang minimum adalah 1%.")
    .max(10_000, "Ambang maksimum adalah 100%."),
});
