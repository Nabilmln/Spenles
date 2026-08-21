import { z } from "zod";
import { moneyString } from "@/lib/money/schema";
import { optionalNoteSchema } from "@/lib/validation/note";

export const recurringRuleIdSchema = z.uuid();

export const recurringRuleSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: moneyString({
      formatMessage: "Jumlah harus berupa rupiah bulat positif.",
      rangeMessage: "Jumlah melewati batas yang didukung.",
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
    note: optionalNoteSchema,
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
