import { z } from "zod";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money/format-idr";

export const recurringRuleIdSchema = z.uuid();

export const recurringRuleSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z
      .string()
      .trim()
      .regex(/^[1-9]\d*$/u, "Jumlah harus berupa rupiah bulat positif.")
      .refine((value) => /^[1-9]\d*$/u.test(value) && BigInt(value) <= MAX_TRANSACTION_AMOUNT, {
        message: "Jumlah melewati batas yang didukung.",
      }),
    accountId: z.uuid("Akun tidak valid."),
    categoryId: z.uuid("Kategori tidak valid."),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    startAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/u, "Waktu mulai tidak valid."),
    endDate: z
      .union([
        z.literal(""),
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Tanggal selesai tidak valid."),
      ])
      .transform((value) => value || null),
    note: z
      .string()
      .trim()
      .max(500, "Catatan maksimal 500 karakter.")
      .transform((value) => value || null),
  })
  .superRefine((value, context) => {
    if (value.endDate && value.endDate < value.startAt.slice(0, 10)) {
      context.addIssue({
        code: "custom",
        message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
        path: ["endDate"],
      });
    }
  });
