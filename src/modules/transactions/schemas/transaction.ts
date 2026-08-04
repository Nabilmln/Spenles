import { z } from "zod";
import { parseJakartaDateTime } from "@/lib/dates/jakarta";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/money/format-idr";

const amountSchema = z
  .string()
  .regex(/^\d+$/u, "Jumlah harus berupa rupiah bulat.")
  .refine((value) => {
    if (!/^\d+$/u.test(value)) return false;
    const amount = BigInt(value);
    return amount > 0 && amount <= MAX_TRANSACTION_AMOUNT;
  }, "Jumlah harus lebih dari nol dan berada dalam batas yang didukung.");

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: amountSchema,
  accountId: z.uuid("Akun tidak valid."),
  categoryId: z.uuid("Kategori tidak valid."),
  transactionAt: z.string().refine((value) => {
    const date = parseJakartaDateTime(value);
    return date && date.getTime() <= Date.now() + 5 * 60_000;
  }, "Tanggal transaksi tidak valid atau terlalu jauh di masa depan."),
  note: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter.")
    .transform((value) => value || null),
});

export const transactionIdSchema = z.uuid();
