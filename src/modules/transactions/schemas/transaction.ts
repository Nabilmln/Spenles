import { z } from "zod";
import { jakartaDateBoundary, jakartaNowDate } from "@/lib/dates/jakarta";
import { moneyString } from "@/lib/money/schema";
import { optionalNoteSchema } from "@/lib/validation/note";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: moneyString({
    allowLeadingZeros: true,
    formatMessage: "Jumlah harus berupa rupiah bulat.",
    rangeMessage: "Jumlah harus lebih dari nol dan berada dalam batas yang didukung.",
  }),
  accountId: z.uuid("Akun tidak valid."),
  categoryId: z.uuid("Kategori tidak valid."),
  transactionAt: z.string().refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
    if (!jakartaDateBoundary(value)) return false;
    return value <= jakartaNowDate();
  }, "Tanggal transaksi tidak valid atau berada di masa depan."),
  note: optionalNoteSchema,
});

export const transactionIdSchema = z.uuid();
